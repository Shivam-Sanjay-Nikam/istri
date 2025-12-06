import { supabase } from '../supabase/client'

export const createOrder = async (orderData) => {
    const { data, error } = await supabase.functions.invoke('create_order', {
        body: orderData
    })
    if (error) throw error
    return data
}

export const getOrdersByPhone = async (phone) => {
    const { data, error } = await supabase.functions.invoke('get_orders_by_phone', {
        body: { phone }
    })
    if (error) throw error
    return data
}
