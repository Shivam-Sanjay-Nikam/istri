import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createServiceRoleClient } from "../_shared/client.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createServiceRoleClient()

        // 1. Auto-delete past slots (older than today)
        // 1. Auto-delete past slots (older than today)
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // "Current date + 48 hrs" roughly implies covering today, tomorrow, and potentially part of day after
        const limitDate = new Date(today)
        limitDate.setDate(today.getDate() + 2)
        const limitStr = limitDate.toISOString().split('T')[0]

        await supabase
            .from('slots')
            .delete()
            .lt('date', todayStr)

        const { data, error } = await supabase
            .from('slots')
            .select('*')
            .eq('is_active', true)
            .gte('date', todayStr)
            .lte('date', limitStr)
            .order('date', { ascending: true })

        if (error) throw error

        // 2. Filter out slots for TODAY defined by time
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        const activeData = data.filter(slot => {
            if (slot.date > todayStr) return true
            // It is today. Check time.
            // Format: "9:00 AM - ..." or "9:00 AM"
            try {
                // simple parser for specific format "H:MM AM/PM"
                const timePart = slot.time.split('-')[0].trim() // "9:00 AM"
                const [timeStr, modifier] = timePart.split(' ')
                let [hours, minutes] = timeStr.split(':')

                let h = parseInt(hours)
                if (modifier === 'PM' && h < 12) h += 12
                if (modifier === 'AM' && h === 12) h = 0

                if (h < currentHour) return false
                if (h === currentHour && parseInt(minutes) <= currentMinute) return false

                return true
            } catch (e) {
                return true // keep if parsing fails to be safe
            }
        })

        // Group by type
        const grouped = {
            pickup: activeData.filter(s => s.slot_type === 'pickup'),
            dropoff: activeData.filter(s => s.slot_type === 'dropoff')
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
