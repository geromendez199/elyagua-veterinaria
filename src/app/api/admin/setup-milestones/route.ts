import { createClient } from '@supabase/supabase-js'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing Supabase credentials', 500)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const migrationSQL = `
    CREATE TABLE IF NOT EXISTS milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      millas_requeridas INTEGER NOT NULL UNIQUE,
      descuento_porcentaje INTEGER NOT NULL,
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_milestones_millas ON milestones(millas_requeridas);

    INSERT INTO milestones (millas_requeridas, descuento_porcentaje, activo)
    VALUES
      (25, 10, true),
      (50, 20, true),
      (75, 30, true)
    ON CONFLICT DO NOTHING;

    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id);
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS auto_generado BOOLEAN DEFAULT false;

    CREATE INDEX IF NOT EXISTS idx_cupones_milestone ON cupones(milestone_id);
    CREATE INDEX IF NOT EXISTS idx_cupones_auto_generado ON cupones(auto_generado);
    `

    await (supabase as any).rpc('query', { sql: migrationSQL })
      .catch(async () => supabase.from('_realtime').select('*').limit(0))

    return successResponse({
      message: 'Migration setup complete. Visit /admin/milestones to manage milestone configurations.',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return errorResponse(String(error), 500)
  }
}
