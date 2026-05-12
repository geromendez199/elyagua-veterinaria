import { createClient } from '@/lib/supabase-browser'

export type AuditAction = 'update_stock' | 'update_price' | 'update_estado' | 'delete_product' | 'create_product' | 'update_product' | 'update_cliente_nota'

export async function logAuditAction(
  action: AuditAction,
  table: string,
  recordId: string,
  changes: Record<string, any>,
  userEmail?: string
) {
  try {
    const supabase = createClient()
    await supabase.from('audit_logs').insert({
      action,
      table,
      record_id: recordId,
      changes,
      user_email: userEmail || 'unknown',
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}
