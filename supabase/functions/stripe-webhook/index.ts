import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const body = await req.text()

  // Basic signature verification (production: use Stripe SDK)
  if (!signature || !webhookSecret) {
    return new Response('Webhook signature required', { status: 400 })
  }

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const obj = event.data.object
  const planMap: Record<string, string> = {
    [Deno.env.get('STRIPE_PRICE_TPE_MONTHLY') || '']: 'tpe_pme',
    [Deno.env.get('STRIPE_PRICE_TPE_ANNUAL') || '']: 'tpe_pme',
    [Deno.env.get('STRIPE_PRICE_AGENCE_MONTHLY') || '']: 'agence',
    [Deno.env.get('STRIPE_PRICE_AGENCE_ANNUAL') || '']: 'agence',
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = obj as { customer: string; subscription: string; metadata: { organization_id: string; plan: string; interval: string } }
      const { organization_id, plan, interval } = session.metadata
      if (organization_id) {
        await supabase.from('organizations').update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan, plan_interval: interval, plan_status: 'active',
        }).eq('id', organization_id)

        await supabase.from('subscriptions').upsert({
          organization_id, plan, status: 'active', stripe_subscription_id: session.subscription, interval,
        }, { onConflict: 'organization_id' })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = obj as { id: string; customer: string; status: string; items: { data: { price: { id: string } }[] }; current_period_end: number }
      const priceId = sub.items.data[0]?.price?.id
      const plan = planMap[priceId] || 'free'
      const { data: org } = await supabase.from('organizations').select('id').eq('stripe_customer_id', sub.customer).single()
      if (org) {
        await supabase.from('organizations').update({
          plan, plan_status: sub.status,
          plan_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('id', org.id)
        await supabase.from('subscriptions').update({ plan, status: sub.status }).eq('organization_id', org.id)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = obj as { customer: string }
      const { data: org } = await supabase.from('organizations').select('id').eq('stripe_customer_id', sub.customer).single()
      if (org) {
        await supabase.from('organizations').update({ plan: 'free', plan_status: 'canceled' }).eq('id', org.id)
        await supabase.from('subscriptions').update({ plan: 'free', status: 'canceled' }).eq('organization_id', org.id)
      }
      break
    }
    case 'invoice.payment_failed': {
      const inv = obj as { customer: string }
      const { data: org } = await supabase.from('organizations').select('id').eq('stripe_customer_id', inv.customer).single()
      if (org) {
        await supabase.from('organizations').update({ plan_status: 'past_due' }).eq('id', org.id)
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
})
