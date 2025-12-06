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
        const { slot_type, date, time, repeat_days } = await req.json()

        const slotsToInsert = []
        const startDate = new Date(date)
        const iterations = repeat_days && repeat_days > 0 ? repeat_days : 1

        for (let i = 0; i < iterations; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            // Format YYYY-MM-DD
            const dateStr = currentDate.toISOString().split('T')[0]

            slotsToInsert.push({
                slot_type,
                date: dateStr,
                time
            })
        }

        const supabase = createServiceRoleClient()
        const { data, error } = await supabase
            .from('slots')
            .insert(slotsToInsert)
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
