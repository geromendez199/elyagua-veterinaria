# El Yagua Veterinaria - API Documentation

This document describes all available API endpoints in the application.

## Table of Contents
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)

## Public Endpoints

### GET /api/articulos
Fetch active articles (educational content about pet care).

**Query Parameters:**
- `activo` (optional): Filter by active status. Default: `true`
- `categoria` (optional): Filter by category (Nutrición, Salud, Prevención, Cuidados, General)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titulo": "string",
      "contenido": "string",
      "categoria": "string",
      "activo": boolean,
      "tipo_mascota": "perro|gato|ambos|null",
      "veterinario_autor": "string|null",
      "created_at": "ISO timestamp"
    }
  ]
}
```

### GET /api/articulos/[id]
Fetch a single article by ID.

### GET /api/clientes/puntos
Fetch customer loyalty points by DNI.

**Query Parameters:**
- `dni` (required): DNI number (7-8 digits)

**Response:**
```json
{
  "success": true,
  "data": {
    "cliente_id": "uuid",
    "nombre": "string",
    "puntos_acumulados": number,
    "cliente_encontrado": boolean
  }
}
```

**Rate Limit:** 30 requests per 15 minutes

### POST /api/cupones/usar
Mark a coupon/milestone as used and deduct customer points.

**Request Body:**
```json
{
  "cupon_id": "uuid",
  "cliente_dni": "string (7-8 digits)",
  "milestone_millas": number (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Cupón utilizado exitosamente"
  }
}
```

**Rate Limit:** 10 requests per 15 minutes

### POST /api/ordenes/registrar-puntos
Register loyalty points for an order.

**Request Body:**
```json
{
  "pedido_id": "uuid",
  "cliente_dni": "string",
  "productos": [
    {
      "id": "uuid",
      "cantidad": number,
      "puntos": number
    }
  ]
}
```

**Rate Limit:** 20 requests per 15 minutes

### GET /api/health
Health check endpoint for monitoring.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "ISO timestamp",
    "responseTime": "Xms",
    "checks": {
      "database": "ok",
      "api": "ok"
    }
  }
}
```

**Status Codes:**
- 200: All systems operational
- 503: Database or critical services unavailable

## Admin Endpoints

All admin endpoints require authentication. Requests without a valid session will receive a 401 response.

### GET /api/admin/milestones
List all loyalty milestones.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "millas_requeridas": number,
      "descuento_porcentaje": number,
      "activo": boolean,
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ]
}
```

**Rate Limit:** 20 requests per 15 minutes

### POST /api/admin/milestones
Create a new loyalty milestone.

**Request Body:**
```json
{
  "millas_requeridas": number (required, positive),
  "descuento_porcentaje": number (required, 1-100),
  "activo": boolean (optional, default: true)
}
```

**Rate Limit:** 5 requests per 15 minutes

### PUT /api/admin/milestones
Update an existing milestone.

**Request Body:**
```json
{
  "id": "uuid (required)",
  "millas_requeridas": number,
  "descuento_porcentaje": number,
  "activo": boolean (optional)
}
```

**Rate Limit:** 5 requests per 15 minutes

### DELETE /api/admin/milestones
Delete a milestone.

**Query Parameters:**
- `id` (required): Milestone UUID

**Rate Limit:** 5 requests per 15 minutes

### GET /api/admin/cupones
List coupons for a customer.

**Query Parameters:**
- `cliente_id` (required): Customer UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "cupones_disponibles": number,
    "cupones": [
      {
        "id": "uuid",
        "cliente_id": "uuid",
        "porcentaje_descuento": number,
        "usado": boolean,
        "created_at": "ISO timestamp"
      }
    ]
  }
}
```

**Rate Limit:** 20 requests per 15 minutes

### POST /api/admin/cupones
Generate coupons for a customer based on accumulated points.

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "cliente_puntos": number
}
```

**Rate Limit:** 5 requests per 15 minutes

### POST /api/admin/mascotas
Add a pet for a customer.

**Request Body:**
```json
{
  "cliente_id": "uuid (required)",
  "nombre": "string (required)",
  "especie": "string (required): perro|gato|otro",
  "raza": "string (optional)",
  "edad": "string (optional)",
  "color": "string (optional)",
  "peso": "string (optional)",
  "observaciones": "string (optional)"
}
```

**Rate Limit:** No explicit rate limit

### DELETE /api/admin/mascotas
Delete a pet.

**Query Parameters:**
- `id` (required): Pet UUID

**Rate Limit:** No explicit rate limit

### PATCH /api/admin/productos/puntos
Update the points value for a product.

**Request Body:**
```json
{
  "producto_id": "uuid (required)",
  "puntos": number (required, non-negative)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "producto_id": "uuid",
    "nombre": "string",
    "puntos_nuevo": number
  }
}
```

### PATCH /api/admin/clientes/puntos
Manually adjust customer loyalty points.

**Request Body:**
```json
{
  "cliente_id": "uuid (required)",
  "cantidad": number (required, can be negative),
  "motivo": "string (required)"
}
```

### POST /api/admin/setup-milestones
Initialize loyalty milestones table with default data.

**Use Case:** Run once to set up the database schema for loyalty features.

## Authentication

All endpoints under `/admin/*` require a valid Supabase authentication session. Authentication is enforced at two levels:

1. **Middleware Level** (`/src/middleware.ts`): Redirects unauthenticated users to `/admin` login page
2. **API Level** (`requireAuth()` function): API endpoints verify the user session

### Checking Authentication Status
The middleware automatically checks user session and redirects to login page for protected routes.

## Rate Limiting

Rate limits are enforced per IP address per endpoint. Response headers indicate remaining quota:

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)
- `Retry-After`: Seconds until retry (on 429 responses only)

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Too many requests. Try again later."
}
```
**Status Code:** 429

### Rate Limit Strategy
Rate limits are stored in-memory with automatic cleanup. If the in-memory store is unavailable, limits fall back to a memory-only implementation for the current server instance.

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid input or missing required parameters
- **401 Unauthorized**: Authentication required but not provided
- **403 Forbidden**: User doesn't have permission for this action
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error
- **503 Service Unavailable**: Critical service (database) unavailable

## Security Headers

All API responses include the following security headers:

- `Content-Security-Policy`: Restricts resource loading to prevent XSS attacks
- `X-Content-Type-Options: nosniff`: Prevents MIME type sniffing
- `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer information

## Caching

Different content types have different cache strategies:

- **Static Assets** (`/_next/static/*`): 1 year immutable cache
- **Font Files** (`/fonts/*`): 1 year immutable cache
- **Pages**: 1 hour with must-revalidate
- **API Responses**: No cache (must-revalidate)

## Notes for Development

1. All database queries use Supabase's query builder with parameterized queries to prevent SQL injection
2. Sensitive operations require authentication via `requireAuth()`
3. Input validation is performed using Zod schemas in `/src/lib/validation/schemas.ts`
4. All API routes are stateless and can be deployed across multiple instances
