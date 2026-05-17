-- Enable RLS on consejos table
ALTER TABLE consejos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read of active consejos
CREATE POLICY "Allow public read active consejos"
ON consejos
FOR SELECT
TO public
USING (activo = true);

-- Policy 2: Allow authenticated users to read all consejos (for admin)
CREATE POLICY "Allow authenticated read all consejos"
ON consejos
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Allow authenticated users to insert consejos
CREATE POLICY "Allow authenticated insert consejos"
ON consejos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 4: Allow authenticated users to update consejos
CREATE POLICY "Allow authenticated update consejos"
ON consejos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 5: Allow authenticated users to delete consejos
CREATE POLICY "Allow authenticated delete consejos"
ON consejos
FOR DELETE
TO authenticated
USING (true);
