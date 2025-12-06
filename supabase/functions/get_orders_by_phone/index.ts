import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createServiceRoleClient } from "../_shared/client.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createServiceRoleClient()
        const { phone } = await req.json()

        // Fetch orders and join with slots to get time details
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        pickup_slot:slots!orders_pickup_slot_id_fkey(*),
        dropoff_slot:slots!orders_dropoff_slot_id_fkey(*)
      `)
            .eq('phone', phone)
            .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify(data), {
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
