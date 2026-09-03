-- =====================================================================
-- W3HIRE ESCROW PROTOCOL: ADMIN ARBITRATION PANEL SCHEMA & SEED
-- Execute this script directly in your Supabase SQL Editor:
-- Project: https://supabase.com/dashboard/project/dgzubapgaqfpicxyvqnl/sql
-- =====================================================================

-- 1. Create the `admins` table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    seat_number INT DEFAULT 1,
    title TEXT DEFAULT 'Platform Arbitrator',
    role TEXT DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Configure Row Level Security (RLS) policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated API and web services
DROP POLICY IF EXISTS "Allow public read access on admins" ON public.admins;
CREATE POLICY "Allow public read access on admins" 
ON public.admins FOR SELECT 
USING (true);

-- 3. Seed Primary Admin (aakankshakpoojari265@gmail.com) + 4 Team Arbitrators
-- When you modify or insert rows here, they will dynamically sync to the Admin Dashboard!
INSERT INTO public.admins (email, password, name, seat_number, title, role)
VALUES 
  (
    'aakankshakpoojari265@gmail.com', 
    '123456', 
    'Aakanksha Poojari', 
    1, 
    'Chief Arbitration Officer', 
    'ADMIN'
  ),
  (
    'admin2@w3hire.io', 
    '123456', 
    'Marcus Vance', 
    2, 
    'Smart Contract Auditor', 
    'ADMIN'
  ),
  (
    'admin3@w3hire.io', 
    '123456', 
    'Sarah Chen', 
    3, 
    'Fintech Compliance Arbitrator', 
    'ADMIN'
  ),
  (
    'admin4@w3hire.io', 
    '123456', 
    'Tariq Al-Mansoor', 
    4, 
    'Escrow Protocol Engineer', 
    'ADMIN'
  ),
  (
    'admin5@w3hire.io', 
    '123456', 
    'David Kim', 
    5, 
    'Dispute Operations Officer', 
    'ADMIN'
  )
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  seat_number = EXCLUDED.seat_number,
  title = EXCLUDED.title,
  role = EXCLUDED.role;

-- 4. Verify insertion
SELECT id, email, name, seat_number, title, role, created_at FROM public.admins ORDER BY seat_number ASC;
