import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getExt = (mime: string) =>
  mime === 'application/pdf' ? 'pdf'
  : mime.startsWith('image/') ? mime.split('/')[1]
  : 'bin'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      subject_base64, subject_media_type,
      copy_base64,    copy_media_type,
      candidate, job_offer,
    } = await req.json()

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY manquant')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    if (!subject_base64 || !subject_media_type) throw new Error('Sujet manquant')
    if (!copy_base64    || !copy_media_type)    throw new Error('Copie du candidat manquante')

    const context = [
      candidate ? `Candidat: ${candidate.first_name} ${candidate.last_name}` : '',
      job_offer  ? `Poste: ${job_offer.title} chez ${job_offer.company}`       : '',
    ].filter(Boolean).join('\n')

    const prompt = `${context ? context + '\n\n' : ''}Tu es un correcteur expert. On te fournit :
1. Le sujet du test technique (première image/document)
2. La copie du candidat (deuxième image/document)

Note la copie sur 20 en te basant sur :
- La complétude des réponses par rapport au sujet
- La justesse technique et la pertinence des solutions
- La qualité de raisonnement et la clarté des explications
- L'originalité ou la profondeur des approches proposées

Réponds UNIQUEMENT avec un JSON valide :
{
  "score_technique": note entière de 0 à 20,
  "note_globale": "appréciation générale en 2 phrases",
  "points_reussis": "ce que le candidat a bien maîtrisé",
  "points_ameliorer": "lacunes ou points à approfondir",
  "commentaire": "commentaire détaillé du correcteur"
}`

    let aiContent: string

    const bothImages = subject_media_type.startsWith('image/') && copy_media_type.startsWith('image/')

    if (bothImages) {
      // Both are images → Chat Completions vision
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [
        { type: 'image_url', image_url: { url: `data:${subject_media_type};base64,${subject_base64}` } },
        { type: 'image_url', image_url: { url: `data:${copy_media_type};base64,${copy_base64}` } },
        { type: 'text', text: prompt },
      ]
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: 'user', content }] }),
      })
      const data = await response.json()
      if (!data.choices?.[0]) throw new Error(data.error?.message || 'Erreur API OpenAI')
      aiContent = data.choices[0].message.content
    } else {
      // At least one PDF → Responses API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildPart = (b64: string, mime: string, label: string): any =>
        mime.startsWith('image/')
          ? { type: 'input_image', image_url: `data:${mime};base64,${b64}` }
          : { type: 'input_file', filename: `${label}.${getExt(mime)}`, file_data: `data:${mime};base64,${b64}` }

      const content = [
        buildPart(subject_base64, subject_media_type, 'sujet'),
        buildPart(copy_base64, copy_media_type, 'copie'),
        { type: 'input_text', text: prompt },
      ]
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, input: [{ role: 'user', content }] }),
      })
      const data = await response.json()
      if (!data.output?.[0]) throw new Error(data.error?.message || 'Erreur API OpenAI (Responses)')
      aiContent = data.output[0].content[0].text
    }

    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
