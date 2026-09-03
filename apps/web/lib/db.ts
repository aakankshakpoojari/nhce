import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres.dgzubapgaqfpicxyvqnl:Dracrys@2026@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 2500,
      max: 3,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

export interface AdminRow {
  id: string;
  email: string;
  password?: string;
  name: string;
  seat_number: number;
  title: string;
  role: string;
  created_at?: string;
}

// Fallback seed accounts if database table has not been created yet
export const DEFAULT_ADMINS: AdminRow[] = [
  {
    id: "adm-owner",
    email: "aakankshakpoojari265@gmail.com",
    password: "123456",
    name: "Aakanksha Poojari",
    seat_number: 1,
    title: "Chief Arbitration Officer",
    role: "ADMIN",
  },
  {
    id: "adm-2",
    email: "admin2@w3hire.io",
    password: "123456",
    name: "Marcus Vance",
    seat_number: 2,
    title: "Smart Contract Auditor",
    role: "ADMIN",
  },
  {
    id: "adm-3",
    email: "admin3@w3hire.io",
    password: "123456",
    name: "Sarah Chen",
    seat_number: 3,
    title: "Fintech Compliance Arbitrator",
    role: "ADMIN",
  },
  {
    id: "adm-4",
    email: "admin4@w3hire.io",
    password: "123456",
    name: "Tariq Al-Mansoor",
    seat_number: 4,
    title: "Escrow Protocol Engineer",
    role: "ADMIN",
  },
  {
    id: "adm-5",
    email: "admin5@w3hire.io",
    password: "123456",
    name: "David Kim",
    seat_number: 5,
    title: "Dispute Operations Officer",
    role: "ADMIN",
  },
];

export async function fetchAdmins(): Promise<AdminRow[]> {
  try {
    const db = getDbPool();
    const result = await db.query(
      "SELECT id, email, password, name, seat_number, title, role, created_at FROM public.admins ORDER BY seat_number ASC, created_at ASC"
    );
    if (result.rows && result.rows.length > 0) {
      return result.rows;
    }
  } catch (err: any) {
    console.warn("Could not query public.admins from database, using fallback default admins:", err.message);
  }
  return DEFAULT_ADMINS;
}
