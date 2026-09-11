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
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        }
      })
      if (!res.ok) {
        throw new Error(`Impossible d'accéder à l'URL (${res.status}). Copiez-collez le texte de l'offre directement.`)
      }
      const html = await res.text()
      jobText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)
      if (jobText.length < 200) {
        throw new Error('Contenu insuffisant récupéré depuis cette URL (site protégé ?). Copiez-collez le texte de l\'offre directement.')
      }
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

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
