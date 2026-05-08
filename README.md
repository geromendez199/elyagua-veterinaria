# 🐾 El Yagua Veterinaria

Sitio web oficial de **El Yagua Veterinaria** — tienda online con catálogo de productos, carrito de compras vía WhatsApp y panel de administración.

🌐 **[elyagua-veterinaria.vercel.app](https://elyagua-veterinaria.vercel.app)**

---

## Stack

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React (App Router) |
| [React 19](https://react.dev) | UI |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilos |
| [Supabase](https://supabase.com) | Base de datos + Auth + Storage |
| [Vercel](https://vercel.com) | Deploy y hosting |
| TypeScript | Tipado |

---

## Funcionalidades

### 🛒 Tienda
- Catálogo de productos con búsqueda en tiempo real
- Filtros por categoría: Alimentos, Juguetes, Remedios, Accesorios
- Carrusel de productos destacados en la home
- Carrito de compras con manejo de cantidades
- Checkout por WhatsApp con mensaje formateado automáticamente

### 🔐 Panel Admin (`/admin`)
- Login con Supabase Auth
- Crear productos con imagen, nombre, descripción, precio, stock y categoría
- Editar precio y stock inline desde la tabla
- Click en la imagen de cualquier producto para actualizarla
- Eliminar productos

### 📱 Mobile
- Diseño 100% responsive (iPhone y Android)
- Menú hamburguesa
- Botón flotante de WhatsApp en todas las páginas
- Scroll horizontal con snap en secciones de cards

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── layout.tsx            # Layout global
│   ├── globals.css           # Estilos globales + variables de marca
│   ├── productos/
│   │   └── page.tsx          # Catálogo de productos
│   ├── contacto/
│   │   └── page.tsx          # Contacto, horarios, redes
│   └── admin/
│       ├── page.tsx          # Login admin
│       ├── layout.tsx
│       └── productos/
│           └── page.tsx      # Gestión de productos
├── components/
│   ├── Navbar.tsx            # Navegación con menú mobile
│   ├── Footer.tsx            # Footer con contacto y horarios
│   ├── CartDrawer.tsx        # Carrito lateral + checkout WhatsApp
│   ├── ProductCard.tsx       # Card individual de producto
│   ├── ProductCarousel.tsx   # Carrusel home
│   ├── ProductsClient.tsx    # Grid de productos con filtros
│   ├── CategoryFilter.tsx    # Botones de filtro por categoría
│   ├── SearchBar.tsx         # Buscador
│   ├── ContactInfo.tsx       # Cards de ubicación/WhatsApp/horarios
│   ├── WhatsAppFloat.tsx     # Botón flotante WhatsApp
│   ├── InstagramIcon.tsx     # SVG ícono Instagram
│   └── FacebookIcon.tsx      # SVG ícono Facebook
├── context/
│   └── CartContext.tsx       # Estado global del carrito
├── lib/
│   └── supabase.ts           # Cliente Supabase
└── types/
    └── index.ts              # Tipos TypeScript
```

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

> ⚠️ Estas variables también deben configurarse en Vercel en **Settings → Environment Variables**.

---

## Base de datos (Supabase)

### Tabla `productos`

```sql
create table productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  precio numeric not null,
  stock integer not null default 0,
  categoria text not null,
  imagen_url text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### RLS Policies

```sql
-- Lectura pública
create policy "Public can read products" on productos
  for select to public using (true);

-- Solo admins autenticados pueden escribir
create policy "Admins can insert products" on productos
  for insert to authenticated with check (true);

create policy "Admins can update products" on productos
  for update to authenticated using (true);

create policy "Admins can delete products" on productos
  for delete to authenticated using (true);

-- Storage
create policy "Public can view product images" on storage.objects
  for select to public using (bucket_id = 'productos');

create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos');
```

### Storage

Crear un bucket público llamado `productos` en **Supabase → Storage**.

---

## Correr localmente

```bash
# Clonar el repositorio
git clone https://github.com/geromendez199/elyagua-veterinaria.git
cd elyagua-veterinaria

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Correr en desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Deploy

El proyecto está configurado para deploy automático en **Vercel** desde la rama `main`.

Cada `git push origin main` dispara un nuevo deploy.

---

## Paleta de colores

| Variable | Color | Uso |
|---|---|---|
| `primary` | `#00BFA5` | Color principal de marca |
| `primary-light` | `#4DD0C4` | Hover, acentos |
| `primary-dark` | `#00897B` | Hover oscuro |
| `dark` | `#3D4D52` | Footer, textos oscuros |

---

## Contacto

📍 Bv Lehmann 609, Rafaela, Santa Fe, Argentina  
📱 [+54 9 3492 730010](https://wa.me/5493492730010)  
📸 [@vet.elyagua](https://instagram.com/vet.elyagua)  
📘 [veterinaria.elyagua](https://www.facebook.com/veterinaria.elyagua)
