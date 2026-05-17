# Supabase Row Level Security (RLS) Policies

## Overview

This document describes the Row Level Security (RLS) policies implemented in the Supabase database for the El Yagua Veterinaria application. RLS provides fine-grained access control at the database level.

## Current RLS Implementation

### Tables with RLS Enabled

#### 1. **consejos** (Educational Content)
- **Public Access**: Anyone can read published content (`activo = true`)
- **Admin Access**: Authenticated admin users can read all content, create, update, and delete
- **Status**: ✅ Implemented in `/src/app/admin/fix-rls/rls-script.sql`
- **Used by**: 
  - Public: `/consejos` page
  - Admin: `/admin/consejos` panel

#### 2. **articulos** (Blog Articles)
- **Status**: ⚠️ **No RLS policies currently defined**
- **Recommendation**: Implement similar to `consejos` table
- **Access Pattern**: 
  - Public: Read active articles (`activo = true`)
  - Admin: Full CRUD operations
- **Suggested Policies**:
  ```sql
  -- Public read
  CREATE POLICY "Allow public read active articulos"
  ON articulos FOR SELECT TO public
  USING (activo = true);
  
  -- Admin full access
  CREATE POLICY "Allow authenticated full access articulos"
  ON articulos FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
  ```

#### 3. **productos** (Product Catalog)
- **Status**: ⚠️ **No RLS policies currently defined**
- **Recommendation**: Public read-only, admin can modify
- **Access Pattern**:
  - Public: Read all products for catalog display
  - Admin: Can update stock and product details
- **Suggested Policies**:
  ```sql
  -- Public read only
  CREATE POLICY "Allow public read all productos"
  ON productos FOR SELECT TO public
  USING (true);
  
  -- Admin can modify
  CREATE POLICY "Allow authenticated update productos"
  ON productos FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
  ```

#### 4. **clientes** (Customer Data)
- **Status**: ⚠️ **No RLS policies currently defined**
- **Concern**: Contains personal data (DNI, phone, addresses, points)
- **Recommendation**: 
  - Public: No read access
  - Admin: Full access
  - Users: Only their own profile (if self-service added)
- **Suggested Policies**:
  ```sql
  -- Admin only
  CREATE POLICY "Allow authenticated full access clientes"
  ON clientes FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
  ```

#### 5. **cupones & milestones** (Loyalty Program)
- **Status**: ⚠️ **No RLS policies currently defined**
- **Access Pattern**:
  - Public: Read active cupones and milestones (for loyalty display)
  - Admin: Manage cupones and milestones
- **Suggested Policies**:
  ```sql
  -- Public can see active loyalty data
  CREATE POLICY "Allow public read active cupones"
  ON cupones FOR SELECT TO public
  USING (activo = true);
  
  -- Admin full access
  CREATE POLICY "Allow authenticated full access cupones"
  ON cupones FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
  ```

#### 6. **pedidos** (Orders)
- **Status**: ⚠️ **No RLS policies currently defined**
- **Concern**: Contains customer order history and payment info
- **Recommendation**: 
  - Admin: Full access
  - Public: No access
  - Optional future: User can see own orders
- **Suggested Policies**:
  ```sql
  -- Admin only
  CREATE POLICY "Allow authenticated full access pedidos"
  ON pedidos FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
  ```

#### 7. **Other Tables** (historial_puntos, mascotas, stock_alerts, administradores, puntos_historial, _realtime)
- **Status**: ⚠️ **No RLS policies defined**
- **Recommendation**: Enable RLS with appropriate policies based on usage

## Security Considerations

### 1. **Current Vulnerabilities**
- Most tables lack RLS policies, relying on API layer for access control
- If Supabase anon key is exposed, unauthenticated users could directly query protected tables
- No row-level ownership checks (e.g., user can't access other users' orders)

### 2. **Best Practices**
- ✅ Always enable RLS on tables with sensitive data
- ✅ Use specific policies instead of `USING (true)`
- ✅ Implement ownership checks for multi-tenant features
- ✅ Use authenticated role for admin operations
- ✅ Default to deny, then explicitly allow specific access

### 3. **Testing RLS Policies**
- Use Supabase Studio → "SQL Editor" to test policies
- Switch user roles: `SET ROLE authenticated;` vs `RESET ROLE;`
- Verify both positive (should allow) and negative (should deny) cases

## Implementation Path

### Phase 1 (High Priority)
1. Enable RLS on `clientes` table - contains personal data
2. Enable RLS on `pedidos` table - contains order history
3. Enable RLS on `cupones` and `milestones` - loyalty data

### Phase 2 (Medium Priority)
1. Enable RLS on `productos` table
2. Enable RLS on `articulos` table
3. Add ownership checks for future user features

### Phase 3 (Ongoing)
1. Monitor for table additions and enable RLS by default
2. Conduct security audit quarterly
3. Document access patterns for new features

## API Layer Security

The API layer in `/src/app/api/` provides an additional security boundary:
- All endpoints should validate user authentication
- Admin endpoints should verify user role/permissions
- Rate limiting (see `/src/lib/api/rate-limit.ts`) prevents abuse
- Input validation with Zod schemas prevents injection attacks

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- RLS Script: `/src/app/admin/fix-rls/rls-script.sql`
- Auth Utilities: `/src/lib/api/auth.ts`
- Rate Limiting: `/src/lib/api/rate-limit.ts`
