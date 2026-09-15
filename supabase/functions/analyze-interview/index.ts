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
    const { transcript, transcript_labelled, recruiter_notes, candidate, job_offer, interview_number } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const context = [
      candidate ? `Candidat: ${candidate.first_name} ${candidate.last_name}` : '',
      job_offer ? `Poste: ${job_offer.title} chez ${job_offer.company}` : '',
      interview_number ? `Entretien numéro: ${interview_number}` : '',
    ].filter(Boolean).join('\n')

    const recruiterSection = recruiter_notes?.trim()
      ? `\nNotes du recruteur:\n${recruiter_notes.trim()}\n`
      : ''

    // Prefer labelled transcript for richer analysis
    const activeTranscript = transcript_labelled?.trim() || transcript?.trim()
    const hasLabelled = !!(transcript_labelled?.trim())

    const transcriptSection = activeTranscript
      ? `\n${hasLabelled ? 'Transcript de l\'entretien (avec identification des interlocuteurs)' : 'Transcript de l\'entretien'}:\n${activeTranscript}`
      : ''

    if (!recruiterSection && !transcriptSection) {
      throw new Error('Au moins un transcript ou des notes recruteur sont nécessaires')
    }

    const labelledInstructions = hasLabelled ? `
Le transcript est formaté avec des préfixes RECRUTEUR: et CANDIDAT: (et parfois INCONNU:).
Pour chaque score, base-toi sur:
- Les réponses du CANDIDAT (qualité, précision, profondeur)
- Les questions posées par le RECRUTEUR (pour comprendre le contexte)
- Les éventuelles questions posées par le CANDIDAT (curiosité, pertinence, qualité de l'engagement)

score_questions_candidat: évalue si le candidat a posé des questions au recruteur, leur pertinence et qualité (curiosité sur le poste, l'équipe, la culture, les défis). 0 = aucune question posée, 100 = questions très pertinentes et engagées.` : `
score_questions_candidat: non disponible sans transcript labellisé, mettre null.`

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
          content: `${context}${recruiterSection}${transcriptSection}
${labelledInstructions}

Analyse cet entretien en tenant compte à la fois du transcript audio ET des notes du recruteur. Réponds UNIQUEMENT avec un JSON valide:
{
  "score": score global de 0 à 100,
  "score_communication": score communication et clarté d'expression de 0 à 100,
  "score_motivation": score motivation et intérêt pour le poste de 0 à 100,
  "score_competences": score compétences techniques et expérience de 0 à 100,
  "score_pertinence": score pertinence et qualité des réponses aux questions de 0 à 100,
  "score_coherence": score cohérence du parcours professionnel de 0 à 100,
  "score_questions_candidat": score qualité des questions posées par le candidat (null si non disponible),
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
