-- Crear tabla de alertas de stock
create table stock_alerts (
  id uuid default gen_random_uuid() primary key,
  producto_id varchar(255) not null,
  email varchar(255) not null,
  nombre varchar(255),
  activa boolean default true,
  notificada boolean default false,
  created_at timestamp with time zone default now(),
  notificada_at timestamp with time zone
);

-- Índice para búsqueda rápida
create index idx_stock_alerts_producto on stock_alerts(producto_id);
create index idx_stock_alerts_email_producto on stock_alerts(email, producto_id);
create index idx_stock_alerts_activa on stock_alerts(activa);

-- Enable RLS
alter table stock_alerts enable row level security;

-- Policy: permite inserción y lectura a todos
create policy "Stock alerts: lectura y creación pública" on stock_alerts
  for select, insert using (true);

-- Policy: permite que el usuario actualice sus propias alertas
create policy "Stock alerts: actualización del usuario" on stock_alerts
  for update using (true);
