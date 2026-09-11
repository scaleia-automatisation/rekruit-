import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, candidate, job_offer, interview_number } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const context = [
      candidate ? `Candidat: ${candidate.first_name} ${candidate.last_name}` : '',
      job_offer ? `Poste: ${job_offer.title} chez ${job_offer.company}` : '',
      interview_number ? `Entretien numéro: ${interview_number}` : '',
    ].filter(Boolean).join('\n')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `${context}

Transcript de l'entretien:
${transcript}

Analyse cet entretien et réponds UNIQUEMENT avec un JSON valide:
{
  "score": score global de 0 à 100,
  "score_communication": score communication de 0 à 100,
  "score_motivation": score motivation de 0 à 100,
  "score_competences": score compétences de 0 à 100,
  "score_pertinence": score pertinence des réponses de 0 à 100,
  "score_coherence": score cohérence du parcours de 0 à 100,
  "strengths": "points forts observés lors de l'entretien",
  "concerns": "points de vigilance ou inquiétudes",
  "summary": "résumé de l'entretien en 3-4 phrases",
  "recommendation": "GO|MAYBE|NO",
  "next_step": "prochaine étape recommandée"
}`
        }]
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
