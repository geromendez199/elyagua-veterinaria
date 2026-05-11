-- Crear tabla de reseñas de productos
create table resenas (
  id uuid default gen_random_uuid() primary key,
  producto_id varchar(255) not null,
  email varchar(255) not null,
  nombre varchar(255) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comentario text,
  verificada boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para búsqueda rápida
create index idx_resenas_producto_id on resenas(producto_id);
create index idx_resenas_email_producto on resenas(email, producto_id);
create index idx_resenas_verificada on resenas(verificada);

-- Enable RLS
alter table resenas enable row level security;

-- Policy: permite lectura a todos
create policy "Resenas: lectura pública" on resenas
  for select using (true);

-- Policy: permite inserción a todos (verificación se hace en el servidor)
create policy "Resenas: inserción pública" on resenas
  for insert with check (true);

-- Trigger para actualizar updated_at automáticamente
create or replace function update_resenas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger resenas_update_timestamp
  before update on resenas
  for each row
  execute function update_resenas_updated_at();
