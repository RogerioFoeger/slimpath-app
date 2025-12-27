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
  console.log('🚀 Webhook CartPanda iniciado!')

  try {
    const contentType = request.headers.get('content-type') || ''
    const url = new URL(request.url)
    let rawBody: any = {}

    // 1. LEITURA DO BODY
    if (contentType.includes('application/json')) {
      rawBody = await request.json()
    } else if (contentType.includes('form')) {
      const formData = await request.formData()
      rawBody = Object.fromEntries(formData.entries())
    }

    // 2. EXTRAÇÃO DE PARÂMETROS DA URL (Query Params)
    const queryParams: any = {}
    url.searchParams.forEach((value, key) => { queryParams[key] = value })

    // 3. SEGURANÇA (SECRET)
    const webhookSecret = 
      url.searchParams.get('secret') || 
      rawBody?.webhook_secret || 
      request.headers.get('x-webhook-secret')

    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET

    if (webhookSecret !== expectedSecret) {
      console.error(`❌ Segredo Inválido!`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Segredo Validado!')

    // 4. NORMALIZAÇÃO DOS DADOS (O TRADUTOR DO CARTPANDA)
    // O CartPanda envia dentro de um objeto "order", mas as vezes envia direto.
    const order = rawBody.order || rawBody

    // A) Email
    const email = order.email || order.customer?.email || queryParams.email

    // B) Nome (Correção do #22)
    // Prioridade: customer.full_name > customer.first_name > order.name (que é o numero do pedido)
    const fullName = 
        order.customer?.full_name || 
        (order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name}` : null) ||
        queryParams.name ||
        "Cliente Sem Nome"

    // C) Plano (Correção do NULL)
    // Lê o SKU do primeiro produto. Se tiver "ANNUAL" ou "YEARLY" é anual. Se não, é mensal.
    let plan = 'monthly' // Padrão
    let sku = ''
    
    if (order.line_items && order.line_items.length > 0) {
        // Pega o primeiro produto da lista
        const item = order.line_items[0]
        sku = item.sku || ''
        const title = item.title || ''
        const variant = item.variant_title || ''
        
        // Verifica se é anual
        const searchString = (sku + title + variant).toUpperCase()
        if (searchString.includes('ANNUAL') || searchString.includes('YEARLY') || searchString.includes('ANUAL')) {
            plan = 'annual'
        }
    }
    
    // Se veio via query params, respeita
    if (queryParams.subscription_plan) plan = queryParams.subscription_plan

    // D) Outros dados
    const transactionId = order.id || queryParams.transaction_id
    const amount = order.total_price || queryParams.amount || 0
    const profileType = queryParams.profile_type || 'falsemagro' // Padrão se não vier

    console.log('🕵️ DADOS FINAIS EXTRAÍDOS:', { 
        email, 
        nome: fullName, 
        plano: plan, 
        sku_detectado: sku 
    })

    if (!email) {
      return NextResponse.json({ error: 'Email missing' }, { status: 400 })
    }

    // 5. LÓGICA DE BANCO DE DADOS (SUPABASE)
    const endDate = new Date()
    if (plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1)
    else endDate.setMonth(endDate.getMonth() + 1)

    // -- Verifica/Cria Auth User --
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)
    let userId: string

    if (existingAuthUser) {
      userId = existingAuthUser.id
      console.log('👤 Usuário Auth já existia.')
    } else {
      console.log('👤 Criando novo Auth...')
      const isTestUser = amount == 0
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: !isTestUser,
        user_metadata: { full_name: fullName, profile_type: profileType },
        password: isTestUser ? 'TestUser123!' : undefined
      })
      if (authError || !authData.user) throw new Error('Falha ao criar Auth')
      userId = authData.user.id
      await new Promise(r => setTimeout(r, 1000))
    }

    // -- Atualiza/Cria Profile na Tabela Users --
    const userData = {
      full_name: fullName,
      profile_type: profileType,
      subscription_plan: plan,
      subscription_end_date: endDate.toISOString(),
      status: 'active',
      webhook_data: { 
          transaction_id: transactionId, 
          amount: amount, 
          source: 'cartpanda',
          raw_sku: sku
      }
    }

    const { data: profile } = await supabase.from('users').select('id').eq('id', userId).maybeSingle()
    
    if (profile) {
      await supabase.from('users').update(userData).eq('id', userId)
      console.log('📝 Perfil atualizado.')
    } else {
      await supabase.from('users').insert({
        id: userId,
        email,
        ...userData,
        current_day: 1,
        slim_points: 0,
        bonus_unlocked: false
      })
      console.log('📝 Novo perfil criado.')
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
        console.error('⚠️ Erro no envio de email:', err)
    }

    return NextResponse.json({ success: true, message: 'Processado com sucesso' })

  } catch (error: any) {
    console.error('❌ Erro Fatal:', error)
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 })
  }
}