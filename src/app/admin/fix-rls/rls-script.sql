-- RLS POLICIES FOR CONSEJOS TABLE
-- Enables fine-grained access control for educational content

-- Enable RLS on consejos table
ALTER TABLE consejos ENABLE ROW LEVEL SECURITY;

-- PUBLIC: Read-only access to published content
-- Used by: Public website /consejos page
CREATE POLICY "Allow public read active consejos"
ON consejos FOR SELECT TO public
USING (activo = true);

-- AUTHENTICATED: Admin users can see all consejos
-- Used by: Admin panel /admin/consejos
CREATE POLICY "Allow authenticated read all consejos"
ON consejos FOR SELECT TO authenticated
USING (true);

-- AUTHENTICATED: Admin users can create new consejos
CREATE POLICY "Allow authenticated insert consejos"
ON consejos FOR INSERT TO authenticated
WITH CHECK (true);

-- AUTHENTICATED: Admin users can update existing consejos
CREATE POLICY "Allow authenticated update consejos"
ON consejos FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- AUTHENTICATED: Admin users can delete consejos
CREATE POLICY "Allow authenticated delete consejos"
ON consejos FOR DELETE TO authenticated
USING (true);
