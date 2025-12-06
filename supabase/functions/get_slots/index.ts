import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createServiceRoleClient } from "../_shared/client.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createServiceRoleClient()

        const { data, error } = await supabase
            .from('slots')
            .select('*')
            .eq('is_active', true)
            .gte('date', new Date().toISOString().split('T')[0]) // Optional: only future slots? User didn't specify, but safer.
            .order('date', { ascending: true })

        if (error) throw error

        // Group by type
        const grouped = {
            pickup: data.filter(s => s.slot_type === 'pickup'),
            dropoff: data.filter(s => s.slot_type === 'dropoff')
        }

        return new Response(JSON.stringify(grouped), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
