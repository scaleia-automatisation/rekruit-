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
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY manquant')

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) throw new Error('Fichier audio manquant')

    // Step 1: Whisper transcription (raw text)
    const openaiForm = new FormData()
    openaiForm.append('file', file, file.name || 'audio.mp3')
    openaiForm.append('model', 'whisper-1')
    openaiForm.append('language', 'fr')
    openaiForm.append('response_format', 'text')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiForm,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Whisper error: ${err}`)
    }

    const transcript = await res.text()

    // Step 2: GPT-4o speaker diarization — label turns as RECRUTEUR/CANDIDAT
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'
    const diarRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse d'entretiens professionnels. Tu reçois la transcription brute d'un entretien entre un recruteur et un candidat. Ton rôle est de restructurer le texte en attribuant chaque réplique au bon interlocuteur.

Règles:
- Le recruteur pose principalement des questions, dirige l'entretien, présente le poste
- Le candidat répond aux questions, décrit son parcours, ses compétences, ses motivations
- Il est possible que le candidat pose aussi des questions (sur le poste, l'équipe, l'entreprise)
- Utilise le contexte pour déduire qui parle à chaque moment
- Format de sortie: chaque prise de parole sur une ligne préfixée par "RECRUTEUR: " ou "CANDIDAT: "
- Si tu n'es vraiment pas sûr d'un passage, préfixe par "INCONNU: "
- Ne modifie pas le contenu des paroles, seulement le format
- Réponds UNIQUEMENT avec le transcript formaté, sans commentaire ni explication`,
          },
          {
            role: 'user',
            content: `Voici la transcription brute de l'entretien:\n\n${transcript}`,
          },
        ],
      }),
    })

    let transcript_labelled = transcript
    if (diarRes.ok) {
      const diarData = await diarRes.json()
      const labelled = diarData.choices?.[0]?.message?.content?.trim()
      if (labelled) transcript_labelled = labelled
    }

    return new Response(JSON.stringify({ transcript, transcript_labelled }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
