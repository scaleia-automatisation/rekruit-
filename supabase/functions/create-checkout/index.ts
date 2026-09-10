import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS: Record<string, Record<string, string>> = {
  tpe_pme: {
    monthly: Deno.env.get('STRIPE_PRICE_TPE_MONTHLY') || '',
    annual: Deno.env.get('STRIPE_PRICE_TPE_ANNUAL') || '',
  },
  agence: {
    monthly: Deno.env.get('STRIPE_PRICE_AGENCE_MONTHLY') || '',
    annual: Deno.env.get('STRIPE_PRICE_AGENCE_ANNUAL') || '',
  },
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(jwt!)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  const { plan, interval, promo_code } = await req.json()
  const priceId = PRICE_IDS[plan]?.[interval]
  if (!priceId) return new Response(JSON.stringify({ error: 'Plan invalide' }), { status: 400, headers: corsHeaders })

  const { data: profile } = await supabase.from('users').select('*, organization:organizations(*)').eq('id', user.id).single()
  const org = (profile as unknown as { organization: { stripe_customer_id: string; id: string; name: string } })?.organization

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
  const origin = req.headers.get('origin') || 'https://rekruit.net'

  // Check promo code discount
  let discountPercent = 0
  if (promo_code) {
    const { data: promo } = await supabase.from('promo_codes')
      .select('*').eq('code', promo_code.toUpperCase()).eq('active', true).single()
    if (promo && (!promo.max_uses || promo.uses_count < promo.max_uses)) {
      discountPercent = promo.discount_percent
    }
  }

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/pricing`,
    'metadata[organization_id]': org?.id || '',
    'metadata[plan]': plan,
    'metadata[interval]': interval,
    customer_email: user.email!,
  })

  if (org?.stripe_customer_id) params.set('customer', org.stripe_customer_id)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const session = await res.json()

  if (discountPercent > 0 && promo_code) {
    await supabase.from('promo_codes').update({ uses_count: supabase.rpc('increment', { x: 1 }) }).eq('code', promo_code.toUpperCase())
  }

  return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
