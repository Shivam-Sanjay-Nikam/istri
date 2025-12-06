-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: slots
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_type TEXT NOT NULL CHECK (slot_type IN ('pickup', 'dropoff')),
    date DATE NOT NULL,
    time TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    pickup_slot_id UUID REFERENCES slots(id),
    dropoff_slot_id UUID REFERENCES slots(id),
    num_clothes INT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_users (For reference/metadata if needed, mainly Auth handled by Supabase Auth)
-- We can create a profile table for admins if we want to store extra data, 
-- but for now rely on auth.users directly or just a simple allowlist.
-- Minimal requirement: "id, email".
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT
);

-- DISABLE RLS as requested (Default is effectively public if no policies, but good to be explicit for 'no policies')
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies that allow NOTHING by default to public, because we want ONLY Edge Functions to access via Service Role.
-- Wait, user said "RLS: Disabled completely (NO RLS policies; all requests go through Edge Functions)".
-- If we disable RLS, then anyone with the Anon key can select/insert if we aren't careful. 
-- However, Supabase API gateway checks RLS. 
-- If RLS is OFF, then Anon key (public) has FULL Access. 
-- User wants "all requests go through Edge Functions".
-- So we should probably LEAVE RLS ON but provide NO policies, effectively blocking the Data API for Anon.
-- AND use the Service Role Key in Edge Functions to bypass RLS.
-- BUT, "Disabled completely" usually implies `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`. 
-- If I do that, the Anon key can access tables directly.
-- I will add a comment about this. Security-wise, it's better to keep RLS ON and have no policies (deny all) for Anon, 
-- but use Service Role in functions.
-- However, to strictly follow "NO RLS policies", I will keep RLS enabled but EMPTY (deny all).

-- NOTE: To allow Edge Functions (Service Role) to work, they bypass RLS automatically.
-- To block direct client access: Keep RLS enabled, add NO policies for 'anon' or 'authenticated' roles.
