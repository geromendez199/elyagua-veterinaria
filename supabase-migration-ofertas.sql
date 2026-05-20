-- Create ofertas table
CREATE TABLE IF NOT EXISTS public.ofertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje', 'combo')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  descuento_porcentaje INTEGER CHECK (descuento_porcentaje IS NULL OR (descuento_porcentaje >= 1 AND descuento_porcentaje <= 100)),
  precio_especial DECIMAL(10, 2) CHECK (precio_especial IS NULL OR precio_especial > 0),
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  activo BOOLEAN DEFAULT true,
  cantidad_maxima_usos INTEGER CHECK (cantidad_maxima_usos IS NULL OR cantidad_maxima_usos >= 0),
  usos_actuales INTEGER DEFAULT 0 CHECK (usos_actuales >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fecha_check CHECK (fecha_inicio < fecha_fin),
  CONSTRAINT tipo_porcentaje_check CHECK (
    (tipo = 'porcentaje' AND descuento_porcentaje IS NOT NULL AND precio_especial IS NULL) OR
    (tipo = 'combo' AND precio_especial IS NOT NULL AND descuento_porcentaje IS NULL)
  )
);

-- Create oferta_productos junction table
CREATE TABLE IF NOT EXISTS public.oferta_productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id uuid NOT NULL REFERENCES public.ofertas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad INTEGER CHECK (cantidad IS NULL OR cantidad > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(oferta_id, producto_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ofertas_activo_fecha ON public.ofertas(activo, fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_ofertas_tipo ON public.ofertas(tipo);
CREATE INDEX IF NOT EXISTS idx_oferta_productos_oferta ON public.oferta_productos(oferta_id);
CREATE INDEX IF NOT EXISTS idx_oferta_productos_producto ON public.oferta_productos(producto_id);

-- Enable RLS
ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oferta_productos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to active offers
CREATE POLICY "Ofertas activas son publicamente visibles"
  ON public.ofertas FOR SELECT
  USING (activo = true);

CREATE POLICY "Oferta productos son publicamente visibles"
  ON public.oferta_productos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ofertas
    WHERE id = oferta_id AND activo = true
  ));

-- Create policies for admin access (anon users cannot insert/update/delete)
-- Only authenticated admins can manage offers through API endpoints with auth checks
DROP POLICY IF EXISTS "Admin puede ver todas las ofertas" ON public.ofertas;
DROP POLICY IF EXISTS "Admin puede insertar ofertas" ON public.ofertas;
DROP POLICY IF EXISTS "Admin puede actualizar ofertas" ON public.ofertas;
DROP POLICY IF EXISTS "Admin puede borrar ofertas" ON public.ofertas;
DROP POLICY IF EXISTS "Admin puede gestionar oferta_productos" ON public.oferta_productos;

CREATE POLICY "Admin can manage all offers"
  ON public.ofertas
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage offer products"
  ON public.oferta_productos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

