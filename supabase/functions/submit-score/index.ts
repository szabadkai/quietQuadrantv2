// supabase/functions/submit-score/index.ts
// Edge function for validated score submission with HMAC anti-cheat

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const HMAC_SECRET = Deno.env.get('SCORE_HMAC_SECRET')
    if (!HMAC_SECRET) {
      console.error('SCORE_HMAC_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { playerName, score, wave, duration, kills, victory, weeklySeed, affixId, checksum, timestamp } = body

    // Validate required fields
    if (!playerName || typeof score !== 'number' || typeof wave !== 'number' || !checksum || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate timestamp (within 60 seconds to account for network latency)
    const now = Date.now()
    if (Math.abs(now - timestamp) > 60000) {
      console.warn(`Timestamp validation failed: now=${now}, timestamp=${timestamp}, diff=${Math.abs(now - timestamp)}`)
      return new Response(
        JSON.stringify({ error: 'Request expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate checksum using HMAC-SHA256
    const payload = `${playerName}:${score}:${wave}:${duration}:${kills}:${victory}:${weeklySeed || ''}:${affixId || ''}:${timestamp}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(HMAC_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedChecksum = btoa(String.fromCharCode(...new Uint8Array(signature)))

    if (checksum !== expectedChecksum) {
      console.warn('Checksum validation failed')
      return new Response(
        JSON.stringify({ error: 'Invalid checksum' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Basic sanity checks on score values
    if (score < 0 || wave < 0 || wave > 1000 || duration < 0 || kills < 0) {
      console.warn('Score sanity check failed')
      return new Response(
        JSON.stringify({ error: 'Invalid score data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert score using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase.from('scores').insert({
      player_name: String(playerName).slice(0, 20).trim(),
      score: Math.floor(score),
      wave: Math.floor(wave),
      duration: Math.floor(duration),
      kills: Math.floor(kills),
      victory: Boolean(victory),
      weekly_seed: weeklySeed ? String(weeklySeed) : null,
      affix_id: affixId ? String(affixId) : null,
      checksum: checksum
    }).select('id').single()

    if (error) {
      console.error('Database insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save score' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
