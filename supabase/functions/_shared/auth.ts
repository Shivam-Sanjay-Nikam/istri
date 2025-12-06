import { createSupabaseClient, createServiceRoleClient } from './client.ts'

export async function verifyAdmin(req: Request) {
    const supabase = createSupabaseClient(req)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized')
    }

    // Check if user is in admin_users table
    // Use Service Role to check this table since RLS might block reading it if policy is strict
    // But wait, we want to be secure.
    const adminDb = createServiceRoleClient()
    const { data: adminUser } = await adminDb
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!adminUser) {
        throw new Error('Forbidden: Not an admin')
    }

    return user
}
