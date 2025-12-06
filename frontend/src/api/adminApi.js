import { supabase } from '../supabase/client'

export const adminGetOrders = async () => {
    const { data, error } = await supabase.functions.invoke('admin_get_orders')
    if (error) throw error
    return data
}

export const adminUpdateStatus = async (order_id, new_status) => {
    const { data, error } = await supabase.functions.invoke('admin_update_status', {
        body: { order_id, new_status }
    })
    if (error) throw error
    return data
}

export const adminAddSlot = async (slotData) => {
    const { data, error } = await supabase.functions.invoke('admin_add_slot', {
        body: slotData
    })
    if (error) throw error
    return data
}

export const adminRemoveSlot = async (slot_id) => {
    const { data, error } = await supabase.functions.invoke('admin_remove_slot', {
        body: { slot_id }
    })
    if (error) throw error
    return data
}
