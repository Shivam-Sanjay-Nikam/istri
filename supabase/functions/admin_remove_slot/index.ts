import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createServiceRoleClient } from "../_shared/client.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { verifyAdmin } from "../_shared/auth.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        await verifyAdmin(req)
        const { slot_id } = await req.json()

        const supabase = createServiceRoleClient()
        // Soft delete: is_active = false
        const { data, error } = await supabase
            .from('slots')
            .update({ is_active: false })
            .eq('id', slot_id)
            .select()

        if (error) throw error

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        const status = error.message.includes('Unauthorized') || error.message.includes('Forbidden') ? 401 : 400
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status,
        })
    }
})
