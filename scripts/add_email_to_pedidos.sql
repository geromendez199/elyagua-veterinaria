-- Agregar columna de email a la tabla pedidos (si no existe)
alter table pedidos add column if not exists cliente_email varchar(255);

-- Crear índice para búsqueda de emails
create index if not exists idx_pedidos_cliente_email on pedidos(cliente_email);
