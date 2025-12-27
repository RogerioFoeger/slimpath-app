import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client for user management
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Anon client for sending emails
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let payload: any = {}
  
  try {
    const contentType = request.headers.get('content-type') || ''
    const url = new URL(request.url)
    
    // =================================================================================
    // CORREÇÃO DO BUG: LER O BODY SEMPRE, MESMO SE TIVER PARÂMETROS NA URL
    // =================================================================================
    
    // 1. Tenta ler o Body (JSON ou Form Data)
    if (contentType) {
      try {
        if (contentType.includes('application/json')) {
          payload = await request.json()
          console.log('📥 Payload JSON recebido')
        } else if (contentType.includes('form')) {
          const formData = await request.formData()
          const entries = Array.from(formData.entries())
          for (const [key, value] of entries) {
            payload[key] = typeof value === 'string' ? value : value.toString()
          }
          console.log('📥 Payload Form Data recebido')
        }
      } catch (e) {
        console.log('⚠️ Aviso: Falha ao ler o body, tentando apenas parâmetros da URL')
      }
    }

    // 2. Normaliza amount se vier como string
    if (payload.amount) {
        if (typeof payload.amount === 'string') {
            payload.amount = parseFloat(payload.amount) || 0
        }
    }

    // 3. Pega os parâmetros da URL (Query Params)
    // Isso é crucial para o CartPanda que manda o segredo na URL
    const queryParams: any = {}
    url.searchParams.forEach((value, key) => {
        queryParams[key] = value
    })

    // 4. MISTURA TUDO: Dados do Body + Dados da URL
    // O Body tem preferência para dados do usuário, a URL tem preferência para o segredo
    const finalData = { ...queryParams, ...payload }

    // =================================================================================
    // VERIFICAÇÃO DE SEGURANÇA
    // =================================================================================

    // Procura o segredo em todos os lugares possíveis
    const webhookSecret = 
      url.searchParams.get('secret') || 
      url.searchParams.get('webhook_secret') ||
      payload.webhook_secret || 
      payload.secret ||
      request.headers.get('x-webhook-secret')

    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET
    
    if (!expectedSecret) {
      console.error('❌ ERRO CRÍTICO: WEBHOOK_SECRET não configurado no .env')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Comparação do segredo
    if (webhookSecret !== expectedSecret) {
      console.error('❌ Segredo Inválido!')
      console.error(`Recebido: ${webhookSecret ? '***' : 'vazio'}`)
      console.error(`Esperado: ***`)
      return NextResponse.json({ error: 'Unauthorized', message: 'Invalid webhook secret' }, { status: 401 })
    }
    
    console.log('✅ Segredo verificado com sucesso!')

    // =================================================================================
    // PROCESSAMENTO DO USUÁRIO
    // =================================================================================

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) baseUrl = 'https://slimpathai.com'
    
    // Extrai dados finais
    const {
      email,
      name,
      profile_type,
      subscription_plan,
      password,
      transaction_id,
      amount
    } = finalData

    if (!email || !profile_type || !subscription_plan) {
      console.error('❌ Faltando campos obrigatórios:', { email, profile_type, subscription_plan })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedProfileType = profile_type.toLowerCase()
    const normalizedSubscriptionPlan = subscription_plan.toLowerCase()

    // Define data de fim
    const endDate = new Date()
    if (normalizedSubscriptionPlan === 'monthly') endDate.setMonth(endDate.getMonth() + 1)
    else if (normalizedSubscriptionPlan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1)

    // --- SUPABASE AUTH ---
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)
    let userId: string

    if (existingAuthUser) {
      console.log(`Usuário já existe no Auth: ${existingAuthUser.id}`)
      userId = existingAuthUser.id
      if (password) {
        await supabase.auth.admin.updateUserById(existingAuthUser.id, { password })
      }
    } else {
      console.log(`Criando novo usuário Auth: ${email}`)
      const isTestUser = amount === 0 || amount === '0'
      const userPassword = password || (isTestUser ? 'TestUser123!' : undefined)
      const shouldAutoConfirm = !isTestUser // Usuários pagos são auto-confirmados

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: shouldAutoConfirm,
        password: userPassword,
        user_metadata: { full_name: name, profile_type: normalizedProfileType },
      })

      if (authError || !authData.user) {
        console.error('Erro ao criar usuário Auth:', authError)
        return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
      }
      userId = authData.user.id
      // Pequena pausa para garantir que o banco processou
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // --- SUPABASE DATABASE (PROFILE) ---
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    const userData = {
        full_name: name || existingProfile?.full_name,
        profile_type: normalizedProfileType,
        subscription_plan: normalizedSubscriptionPlan,
        subscription_end_date: endDate.toISOString(),
        status: 'active',
        webhook_data: { transaction_id, amount, received_at: new Date().toISOString() }
    }

    if (existingProfile) {
      console.log('Atualizando perfil existente...')
      await supabase.from('users').update(userData).eq('id', userId)
    } else {
      console.log('Criando novo perfil manualmente...')
      await supabase.from('users').insert({
        id: userId,
        email,
        ...userData,
        current_day: 1,
        slim_points: 0,
        bonus_unlocked: false
      })
    }

    // --- ONBOARDING ---
    const { data: onboarding } = await supabase.from('user_onboarding').select('user_id').eq('user_id', userId).maybeSingle()
    if (!onboarding) {
        await supabase.from('user_onboarding').insert({ user_id: userId, onboarding_completed: false })
    }

    // --- MAGIC LINK ---
    const redirectUrl = `${baseUrl}/onboarding`
    const isTestUser = amount === 0 || amount === '0'
    const isUserConfirmed = !isTestUser

    try {
        // Envia email de login/magic link
        await supabaseAnon.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectUrl,
                shouldCreateUser: false 
            }
        })
        console.log('✅ Magic Link enviado com sucesso!')
    } catch (err) {
        console.error('⚠️ Usuário criado, mas falha ao enviar email:', err)
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      message: 'Webhook processed successfully'
    })

  } catch (error: any) {
    console.error('❌ Erro Fatal no Webhook:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}