-- Crear tabla de cupones/códigos de descuento
create table cupones (
  id uuid default gen_random_uuid() primary key,
  codigo varchar(50) unique not null,
  descuento_porcentaje numeric(5, 2) not null check (descuento_porcentaje > 0 and descuento_porcentaje <= 100),
  activo boolean default true,
  usos_totales integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índice para búsqueda rápida por código
create index idx_cupones_codigo on cupones(codigo);

-- Enable RLS
alter table cupones enable row level security;

-- Policy: permite lectura a todos (los cupones se validan en CartDrawer)
create policy "Cupones: lectura pública" on cupones
  for select using (true);

-- Insertar algunos cupones de ejemplo
insert into cupones (codigo, descuento_porcentaje, activo) values
  ('PROMO10', 10.00, true),
  ('DESCUENTO15', 15.00, true),
  ('VERANO20', 20.00, true),
  ('INACTIVO', 5.00, false);
