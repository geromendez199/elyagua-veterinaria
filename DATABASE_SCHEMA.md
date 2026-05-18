# Database Schema Documentation

This document describes the structure of the Supabase database used by El Yagua Veterinaria.

## Tables

### clientes (Customers)
Stores customer information and loyalty program data.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| dni | TEXT | UNIQUE, NOT NULL | Customer ID number (7-8 digits) |
| nombre | TEXT | NOT NULL | Full name |
| telefono | TEXT | | Phone number with +549 country code |
| email | TEXT | | Email address |
| notas | TEXT | | Internal notes |
| puntos_acumulados | INTEGER | DEFAULT 0 | Loyalty points balance |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update date |

**Indexes:**
- `idx_clientes_dni`: On `dni` for quick lookups

**Use Cases:**
- Customer information lookup by DNI
- Loyalty points management
- Customer history and notes

---

### mascotas (Pets)
Stores pet information for customers.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| cliente_id | UUID | FOREIGN KEY → clientes.id | Customer who owns the pet |
| nombre | TEXT | NOT NULL | Pet name |
| especie | TEXT | NOT NULL | Species: perro, gato, otro |
| raza | TEXT | | Breed |
| edad | TEXT | | Age (free text) |
| color | TEXT | | Color/appearance |
| peso | TEXT | | Weight (free text, with units) |
| observaciones | TEXT | | Medical notes, allergies, etc. |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update date |

**Indexes:**
- `idx_mascotas_cliente`: On `cliente_id` for retrieving pets by customer

**Use Cases:**
- Pet medical history
- Vaccination records
- Allergy and special care notes

---

### productos (Products)
Stores product inventory information.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| nombre | TEXT | NOT NULL | Product name |
| descripcion | TEXT | | Detailed description |
| precio | DECIMAL | NOT NULL | Sale price in ARS |
| stock | INTEGER | DEFAULT 0 | Current inventory count |
| puntos | INTEGER | DEFAULT 0 | YaguaMillas earned per unit |
| categoria | TEXT | | Product category |
| imagen_url | TEXT | | URL to product image in Supabase Storage |
| activo | BOOLEAN | DEFAULT true | Soft delete flag |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update date |

**Indexes:**
- `idx_productos_activo`: On `activo` for filtering active products
- `idx_productos_categoria`: On `categoria` for category filtering

**Use Cases:**
- Product catalog
- Inventory management
- Pricing and loyalty points configuration

---

### pedidos (Orders)
Stores order/purchase records.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| nombre | TEXT | NOT NULL | Customer name at purchase |
| telefono | TEXT | NOT NULL | Phone number for delivery coordination |
| tipo_entrega | TEXT | NOT NULL | "retiro" (store pickup) or "envio" (delivery) |
| direccion | TEXT | | Delivery address (null for pickup) |
| productos | JSONB | | Array of {id, nombre, cantidad, precio} |
| total | DECIMAL | NOT NULL | Final order amount |
| cupón_id | UUID | FK → cupones.id (nullable) | Applied coupon |
| cliente_dni | TEXT | | Customer DNI if registered |
| metodo_pago | TEXT | | Payment method: efectivo, debito, credito |
| estado | TEXT | DEFAULT "pendiente" | Order status |
| created_at | TIMESTAMPTZ | DEFAULT now() | Order creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last status update |

**Indexes:**
- `idx_pedidos_cliente_dni`: On `cliente_dni` for customer order lookup
- `idx_pedidos_created_at`: On `created_at` for chronological queries

**Use Cases:**
- Sales records
- Customer purchase history
- Delivery tracking
- Revenue analysis

---

### cupones (Coupons/Discounts)
Stores coupon records including milestone-based rewards.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| cliente_id | UUID | FK → clientes.id | Customer who earned/owns the coupon |
| porcentaje_descuento | INTEGER | NOT NULL | Discount percentage (1-100) |
| usado | BOOLEAN | DEFAULT false | Whether coupon has been redeemed |
| used_at | TIMESTAMPTZ | | When coupon was redeemed |
| milestone_id | UUID | FK → milestones.id | Associated milestone (if any) |
| auto_generado | BOOLEAN | DEFAULT false | True for auto-generated milestone coupons |
| created_at | TIMESTAMPTZ | DEFAULT now() | Coupon creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update date |

**Indexes:**
- `idx_cupones_cliente`: On `cliente_id` for retrieving customer coupons
- `idx_cupones_usado`: On `usado` for finding available coupons
- `idx_cupones_milestone`: On `milestone_id` for milestone tracking
- `idx_cupones_auto_generado`: On `auto_generado` for system-generated coupons

**Use Cases:**
- Loyalty program rewards
- Promotional discounts
- Customer incentives

---

### milestones (Loyalty Milestones)
Stores loyalty program tier definitions.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| millas_requeridas | INTEGER | NOT NULL, UNIQUE | YaguaMillas needed to reach this tier |
| descuento_porcentaje | INTEGER | NOT NULL | Reward discount percentage |
| activo | BOOLEAN | DEFAULT true | Whether this tier is active |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update date |

**Indexes:**
- `idx_milestones_millas`: On `millas_requeridas` for tier lookups
- `idx_milestones_activo`: On `activo` for active tier filtering

**Default Tiers:**
- 25 YaguaMillas → 10% discount
- 50 YaguaMillas → 20% discount
- 75 YaguaMillas → 30% discount

**Use Cases:**
- Loyalty program configuration
- Discount tier management
- Customer tier eligibility checking

---

### puntos_historial (Points History)
Audit log of all loyalty points transactions.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| cliente_id | UUID | FK → clientes.id | Customer whose points changed |
| tipo | TEXT | NOT NULL | Transaction type: compra, ajuste_manual, canje, etc. |
| cantidad_puntos | INTEGER | NOT NULL | Points added (positive) or removed (negative) |
| referencia | TEXT | | Reference: pedido_id, cupon_id, etc. |
| created_at | TIMESTAMPTZ | DEFAULT now() | Transaction timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last modification |

**Indexes:**
- `idx_puntos_historial_cliente`: On `cliente_id` for customer history
- `idx_puntos_historial_created_at`: On `created_at` for chronological queries

**Use Cases:**
- Loyalty points audit trail
- Customer points history view
- Points reconciliation

---

### articulos (Articles - Educational Content)
Stores veterinary educational content and advice.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| titulo | TEXT | NOT NULL | Article title |
| contenido | TEXT | NOT NULL | Article body (markdown) |
| categoria | TEXT | NOT NULL | Nutrición, Salud, Prevención, Cuidados, General |
| imagen_url | TEXT | | Header image URL |
| activo | BOOLEAN | DEFAULT true | Publish status |
| tipo_mascota | TEXT | | Target animal: perro, gato, ambos, null (all) |
| veterinario_autor | TEXT | | Author name/credentials |
| created_at | TIMESTAMPTZ | DEFAULT now() | Publication date |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last edit date |

**Indexes:**
- `idx_articulos_activo`: On `activo` for published articles
- `idx_articulos_categoria`: On `categoria` for category filtering

**Use Cases:**
- Public knowledge base
- Pet care advice
- Health and nutrition tips
- SEO-friendly content

---

### rate_limits (Rate Limiting - Optional)
Tracks API rate limit hits (if using database-backed rate limiting).

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| key | TEXT | UNIQUE | IP:endpoint identifier |
| count | INTEGER | DEFAULT 0 | Request count in current window |
| reset_time | TIMESTAMPTZ | | When the counter resets |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation |

**Note:** Currently using in-memory rate limiting with automatic cleanup. Database table is optional for persistence.

---

## Row Level Security (RLS) Policies

### clientes Table
- **Public Read**: Disabled (customers can only see their own data)
- **Public Write**: Disabled
- **Admin Write**: Enabled (authenticated users can manage customer records)

### mascotas Table
- **Soft cascading delete**: When a cliente is deleted, associated mascotas should be handled

### productos Table
- **Public Read**: Enabled (everyone can view product catalog)
- **Admin Write**: Only authenticated users can edit products

### pedidos Table
- **Public Write**: Enabled for guest checkouts
- **Admin Read**: Authenticated users can view all orders

### articulos Table
- **Public Read**: Only active articles (`activo = true`)
- **Admin Write**: Only authenticated users can publish/edit

---

## Storage Buckets (Supabase Storage)

### Public Buckets
All image buckets are configured as public read (images are displayed on the website).

#### consejos
- **Purpose**: Images for pet advice/tips articles
- **Path Format**: `/article/{article_id}.{ext}`
- **Public**: Yes

#### info
- **Purpose**: Images for educational articles
- **Path Format**: `/article/{article_id}.{ext}`
- **Public**: Yes

#### productos
- **Purpose**: Product catalog images
- **Path Format**: `/product/{product_id}.{ext}`
- **Public**: Yes

---

## Query Optimization Notes

### Frequently Used Queries

**1. Customer Lookup with Loyalty Data**
```sql
SELECT c.id, c.dni, c.nombre, c.puntos_acumulados
FROM clientes c
WHERE c.dni = $1
LIMIT 1
```
- Uses index: `idx_clientes_dni`

**2. Fetch Customer's Available Coupons**
```sql
SELECT * FROM cupones
WHERE cliente_id = $1 AND usado = false
ORDER BY created_at ASC
```
- Uses indexes: `idx_cupones_cliente`, `idx_cupones_usado`

**3. Active Products by Category**
```sql
SELECT * FROM productos
WHERE activo = true AND categoria = $1
ORDER BY nombre
```
- Uses indexes: `idx_productos_activo`, `idx_productos_categoria`

**4. Published Articles**
```sql
SELECT * FROM articulos
WHERE activo = true
ORDER BY created_at DESC
```
- Uses index: `idx_articulos_activo`

---

## Performance Considerations

1. **Points Calculation**: The `puntos_acumulados` field is cached on the cliente row for performance. Use RPC function `adjust_puntos_manual()` to maintain consistency.

2. **Image URLs**: All images are stored in Supabase Storage and referenced by URL. Images are not cached in the database.

3. **Order JSONB**: Product details are stored as JSONB in the pedidos table to prevent normalization issues when products are deleted.

4. **Soft Deletes**: Products and articles use `activo` boolean instead of hard deletion to preserve historical data.

---

## Migration History

- **v1**: Initial schema with clientes, productos, pedidos, mascotas
- **v2**: Added loyalty system (milestones, cupones, puntos_historial)
- **v3**: Added educational content (articulos)
- **v4**: Added pet type and veterinarian author fields to articulos
