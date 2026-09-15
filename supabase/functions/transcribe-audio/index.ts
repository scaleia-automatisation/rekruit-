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

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
