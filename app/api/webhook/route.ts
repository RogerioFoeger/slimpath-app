import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🚀 Webhook iniciado!')

  try {
    const contentType = request.headers.get('content-type') || ''
    const url = new URL(request.url)
    let payload: any = {}

    // 1. TENTA LER O BODY (JSON ou FORM)
    if (contentType) {
      try {
        if (contentType.includes('application/json')) {
          payload = await request.json()
          // O "DETETIVE": Mostra exatamente o que chegou
          console.log('📦 JSON Recebido (Raw):', JSON.stringify(payload, null, 2))
        } else if (contentType.includes('form')) {
          const formData = await request.formData()
          const entries = Array.from(formData.entries())
          for (const [key, value] of entries) {
            payload[key] = value.toString()
          }
          console.log('📦 Form Data Recebido:', payload)
        }
      } catch (e) {
        console.log('⚠️ Falha ao ler body:', e)
      }
    }

    // 2. PEGA PARÂMETROS DA URL
    const queryParams: any = {}
    url.searchParams.forEach((value, key) => { queryParams[key] = value })
    console.log('🔗 Query Params:', queryParams)

    // 3. SEGURANÇA: VERIFICA O SEGREDO
    // Procura o segredo na URL, no Body ou no Header
    const webhookSecret = 
      url.searchParams.get('secret') || 
      url.searchParams.get('webhook_secret') ||
      payload?.webhook_secret || 
      payload?.secret ||
      request.headers.get('x-webhook-secret')

    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET

    if (webhookSecret !== expectedSecret) {
      console.error(`❌ Segredo Inválido! Recebido: ${webhookSecret} | Esperado: ${expectedSecret?.slice(0,5)}***`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Segredo Validado!')

    // 4. BUSCA INTELIGENTE DE DADOS (Normalização)
    // CartPanda pode mandar aninhado em 'order' ou 'customer'
    // Prioridade: Query Params > Raiz > Customer > Order.Customer
    
    const getField = (key: string) => {
      return queryParams[key] || 
             payload[key] || 
             payload?.customer?.[key] || 
             payload?.order?.customer?.[key] || 
             payload?.order?.[key]
    }

    const email = getField('email')
    const name = getField('name') || getField('full_name')
    // Se não achar o profile_type, assume padrão para não travar
    const profile_type = getField('profile_type') || queryParams['profile_type'] || 'falsemagro' 
    // Se não achar o plano, assume mensal
    const subscription_plan = getField('subscription_plan') || queryParams['subscription_plan'] || 'monthly'
    
    const transaction_id = getField('transaction_id') || getField('id')
    const amount = getField('amount') || getField('total')

    console.log('🕵️ Dados Extraídos:', { email, name, profile_type, subscription_plan })

    if (!email) {
      console.error('❌ ERRO: Email não encontrado em lugar nenhum!')
      console.error('Payload completo para análise:', JSON.stringify(payload, null, 2))
      return NextResponse.json({ error: 'Email missing' }, { status: 400 })
    }

    // 5. LÓGICA DO SUPABASE (Criar/Atualizar Usuário)
    const normalizedProfileType = String(profile_type).toLowerCase()
    const normalizedSubscriptionPlan = String(subscription_plan).toLowerCase()
    
    // Calcula validade
    const endDate = new Date()
    if (normalizedSubscriptionPlan.includes('annual')) endDate.setFullYear(endDate.getFullYear() + 1)
    else endDate.setMonth(endDate.getMonth() + 1)

    // -- Verifica Auth --
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)
    let userId: string

    if (existingAuthUser) {
      console.log(`👤 Usuário Auth encontrado: ${existingAuthUser.id}`)
      userId = existingAuthUser.id
    } else {
      console.log(`👤 Criando novo usuário Auth: ${email}`)
      const isTestUser = amount == 0
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: !isTestUser, // Auto-confirma se pagou
        user_metadata: { full_name: name, profile_type: normalizedProfileType },
        password: isTestUser ? 'TestUser123!' : undefined
      })
      
      if (authError || !authData.user) {
        console.error('❌ Erro ao criar Auth:', authError)
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
      }
      userId = authData.user.id
      await new Promise(r => setTimeout(r, 1000)) // Espera propagação
    }

    // -- Atualiza/Cria Profile --
    const userData = {
      full_name: name,
      profile_type: normalizedProfileType,
      subscription_plan: normalizedSubscriptionPlan,
      subscription_end_date: endDate.toISOString(),
      status: 'active',
      webhook_data: { transaction_id, amount, received_at: new Date().toISOString() }
    }

    const { data: profile } = await supabase.from('users').select('id').eq('id', userId).maybeSingle()
    
    if (profile) {
      console.log('📝 Atualizando perfil existente...')
      await supabase.from('users').update(userData).eq('id', userId)
    } else {
      console.log('📝 Criando novo perfil...')
      await supabase.from('users').insert({
        id: userId,
        email,
        ...userData,
        current_day: 1,
        slim_points: 0,
        bonus_unlocked: false
      })
    }

    // -- Garante Onboarding --
    const { data: onboarding } = await supabase.from('user_onboarding').select('user_id').eq('user_id', userId).maybeSingle()
    if (!onboarding) {
        await supabase.from('user_onboarding').insert({ user_id: userId, onboarding_completed: false })
    }

    // -- Envia Magic Link --
    try {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://slimpathai.com'}/onboarding`
        await supabaseAnon.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectUrl, shouldCreateUser: false }
        })
        console.log('📧 Magic Link enviado!')
    } catch (err) {
        console.error('⚠️ Falha no envio do email:', err)
    }

    return NextResponse.json({ success: true, message: 'Processado com sucesso' })

  } catch (error: any) {
    console.error('❌ Erro Fatal:', error)
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 })
  }
}