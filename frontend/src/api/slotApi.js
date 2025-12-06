import { supabase } from '../supabase/client'

export const getSlots = async () => {
    const { data, error } = await supabase.functions.invoke('get_slots')
    if (error) throw error
    return data
}
