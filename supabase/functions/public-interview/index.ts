import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token manquant' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    if (req.method === 'GET') {
      const { data: tokenData, error } = await supabase
        .from('interview_tokens')
        .select(`
          *,
          interview:interviews(
            id,
            interview_number,
            candidate:candidates(first_name, last_name),
            job_offer:job_offers(title, company)
          )
        `)
        .eq('token', token)
        .single()

      if (error || !tokenData) {
        return new Response(JSON.stringify({ error: 'Lien invalide ou expiré' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: slots } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('interview_id', tokenData.interview_id)
        .order('slot_datetime')

      return new Response(JSON.stringify({ token: tokenData, slots }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const { slot_id } = await req.json()

      const { data: tokenData } = await supabase
        .from('interview_tokens')
        .select('*')
        .eq('token', token)
        .single()

      if (!tokenData || tokenData.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Ce lien a déjà été utilisé' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      await supabase
        .from('interview_tokens')
        .update({ status: 'accepted', selected_slot_id: slot_id })
        .eq('token', token)

      await supabase
        .from('interview_slots')
        .update({ status: 'confirmed' })
        .eq('id', slot_id)

      await supabase
        .from('interviews')
        .update({ status: 'scheduled' })
        .eq('id', tokenData.interview_id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
