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
    const { text, url } = await req.json()
    let jobText = text || ''

    if (url && !jobText) {
      const res = await fetch(url)
      const html = await res.text()
      jobText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'claude-opus-5'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyse cette offre d'emploi et extrais les informations en JSON.

Offre:
${jobText}

Réponds UNIQUEMENT avec un JSON valide ayant ces champs:
{
  "title": "titre du poste",
  "company": "nom de l'entreprise",
  "location": "lieu (ville, pays)",
  "contract_type": "CDI|CDD|Stage|Freelance|Alternance",
  "salary_range": "fourchette salariale si mentionnée",
  "description": "description générale du poste (2-3 phrases)",
  "missions": "liste des missions principales",
  "skills": "compétences techniques requises",
  "experience": "années d'expérience requises",
  "education": "niveau d'études requis",
  "languages": "langues requises",
  "mandatory_criteria": "critères absolument requis",
  "preferred_criteria": "critères appréciés mais non obligatoires"
}`
        }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text
    const parsed = JSON.parse(content)

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
