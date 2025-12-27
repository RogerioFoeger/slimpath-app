import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  console.log('🚀 Webhook CartPanda iniciado (Versão Final)')

  try {
    const contentType = request.headers.get('content-type') || ''
    const url = new URL(request.url)
    let rawBody: any = {}

    // 1. LEITURA DOS DADOS
    if (contentType.includes('application/json')) {
      rawBody = await request.json()
    } else if (contentType.includes('form')) {
      const formData = await request.formData()
      rawBody = Object.fromEntries(formData.entries())
    }

    const queryParams: any = {}
    url.searchParams.forEach((value, key) => { queryParams[key] = value })

    // 2. SEGURANÇA
    const webhookSecret = 
      url.searchParams.get('secret') || 
      rawBody?.webhook_secret || 
      request.headers.get('x-webhook-secret')

    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET

    if (webhookSecret !== expectedSecret) {
      console.error(`❌ Segredo Inválido!`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. TRADUÇÃO DOS DADOS (CARTPANDA -> SUPABASE)
    const order = rawBody.order || rawBody

    // Email
    const email = order.email || order.customer?.email || queryParams.email

    // Nome
    const fullName = 
        order.customer?.full_name || 
        (order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name}` : null) ||
        queryParams.name ||
        "Cliente Sem Nome"

    // Plano (Detecção por SKU)
    let plan = 'monthly' // Padrão
    let sku = ''
    if (order.line_items && order.line_items.length > 0) {
        const item = order.line_items[0]
        sku = item.sku || ''
        const searchString = (sku + (item.title||'') + (item.variant_title||'')).toUpperCase()
        if (searchString.includes('ANNUAL') || searchString.includes('YEARLY') || searchString.includes('ANUAL')) {
            plan = 'annual'
        }
    }
    if (queryParams.subscription_plan) plan = queryParams.subscription_plan

    // CORREÇÃO DO BUG: Profile Type
    // Se não vier no link, manda null. NÃO manda 'falsemagro' se o banco não aceitar.
    const profileType = queryParams.profile_type || null 

    const transactionId = order.id || queryParams.transaction_id
    const amount = order.total_price || queryParams.amount || 0

    if (!email) return NextResponse.json({ error: 'Email missing' }, { status: 400 })

    console.log('🕵️ Dados Prontos:', { email, fullName, plan, profileType })

    // 4. GRAVAÇÃO NO BANCO (AUTH + PUBLIC)
    const endDate = new Date()
    if (plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1)
    else endDate.setMonth(endDate.getMonth() + 1)

    // A) Garante Usuário Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)
    let userId: string

    if (existingAuthUser) {
      userId = existingAuthUser.id
    } else {
      const isTestUser = amount == 0
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: !isTestUser,
        user_metadata: { full_name: fullName }, // Removi profile_type daqui para evitar conflito
        password: isTestUser ? 'TestUser123!' : undefined
      })
      if (authError || !authData.user) throw new Error('Falha ao criar Auth: ' + authError?.message)
      userId = authData.user.id
      // Pequena pausa para o Trigger do banco rodar (se houver)
      await new Promise(r => setTimeout(r, 1000))
    }

    // B) UPSERT NA TABELA USERS (O Corretor Blindado)
    // Usa upsert para criar ou atualizar, ignorando se o trigger já criou a linha vazia
    const { error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        email: email,
        full_name: fullName,
        subscription_plan: plan,
        subscription_end_date: endDate.toISOString(),
        status: 'active',
        // Só envia profile_type se ele existir (para não quebrar enum)
        ...(profileType ? { profile_type: profileType } : {}),
        webhook_data: { 
            transaction_id: transactionId, 
            amount: amount, 
            source: 'cartpanda',
            raw_sku: sku
        }
    }, { 
        onConflict: 'id' 
    })

    if (upsertError) {
        console.error('❌ Erro ao gravar no banco:', upsertError)
        // Não retorna erro 500 para não travar o CartPanda, mas loga o erro
    } else {
        console.log('✅ Perfil gravado com sucesso (Upsert)!')
    }

    // 5. ONBOARDING E EMAIL
    const { data: onboarding } = await supabase.from('user_onboarding').select('user_id').eq('user_id', userId).maybeSingle()
    
    if (!onboarding) {
        // Correção do erro do .catch():
        // O Supabase não joga erro (throw), ele retorna um objeto { error }
        const { error: onboardingError } = await supabase
            .from('user_onboarding')
            .insert({ user_id: userId, onboarding_completed: false })
            
        if (onboardingError) {
            console.log('⚠️ Aviso: Onboarding já existia ou falhou levemente:', onboardingError.message)
        }
    }

    try {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://slimpathai.com'}/onboarding`
        await supabaseAnon.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectUrl, shouldCreateUser: false }
        })
        console.log('📧 Email enviado!')
    } catch (err) {
        console.error('⚠️ Erro envio email:', err)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Erro Fatal:', error)
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 })
  }
}