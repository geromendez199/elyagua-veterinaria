# Deployment Guide

This document describes how to deploy El Yagua Veterinaria and configure the necessary environment variables.

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm or yarn
- Supabase account with a project
- Vercel account (for deploying to production)

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role (only needed for setup scripts, not in client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://elyagua-veterinaria.vercel.app
```

### Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Mercado Pago (when payment integration is ready)
MP_ACCESS_TOKEN=your_mp_token_here
```

## Getting Environment Variables from Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** (show key) → `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Initialize Database (if new)
```bash
# Set up storage buckets
npm run setup:storage

# Initialize loyalty program milestones
curl -X POST http://localhost:3000/api/admin/setup-milestones
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Access Admin Panel
- Navigate to `http://localhost:3000/admin`
- Sign up with your email (Supabase auth)
- Start managing products, customers, and content

## Database Setup

The database schema is created automatically through Supabase migrations. Required tables:

- `clientes` - Customer information
- `productos` - Product catalog
- `pedidos` - Orders
- `mascotas` - Pet information
- `cupones` - Loyalty coupons
- `milestones` - Loyalty tiers
- `puntos_historial` - Points transaction log
- `articulos` - Educational content

### Initialize Loyalty Milestones

After database is set up, initialize default loyalty tiers:

```bash
curl -X POST \
  http://localhost:3000/api/admin/setup-milestones \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

This creates:
- 25 YaguaMillas → 10% discount
- 50 YaguaMillas → 20% discount
- 75 YaguaMillas → 30% discount

## Production Deployment (Vercel)

### 1. Push Code to GitHub

```bash
git push origin main
```

### 2. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your repository
4. Vercel will auto-detect Next.js framework

### 3. Configure Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the production values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your production domain)
   - `NEXT_PUBLIC_GA_ID` (if using analytics)
   - `SUPABASE_SERVICE_ROLE_KEY` (for setup endpoints only)

### 4. Deploy

- Click "Deploy" in Vercel dashboard
- Vercel will automatically build and deploy your site
- Your site will be available at `https://your-project.vercel.app`

### 5. Custom Domain

1. In Vercel: Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` in environment variables

## Database Configuration for Production

### Row Level Security (RLS)

Ensure RLS policies are configured in Supabase:

1. Go to Supabase → **Authentication** → **Policies**
2. Configure policies for:
   - **Public access**: `productos`, `articulos` (read-only)
   - **Authenticated access**: `clientes`, `cupones`, `pedidos`

### Backups

Enable automatic backups in Supabase:

1. Go to **Settings** → **Backups**
2. Enable daily/weekly backups
3. Retention: minimum 7 days recommended

### Connection Pooling

For production, consider using Supabase Connection Pooling:

1. Go to **Database** → **Connection** → **Connection Pooling**
2. Enable pooling (recommended for serverless)
3. Use pooling connection string in production

## Security Checklist

- [ ] All environment variables are set and not committed to Git
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase RLS policies are configured
- [ ] Authentication is required for admin routes
- [ ] Rate limiting is active on public API endpoints
- [ ] HTTPS is enforced on custom domain
- [ ] Content Security Policy headers are configured
- [ ] CORS is properly configured if needed
- [ ] API keys have appropriate permissions (use service role for admin, anon key for public)

## Monitoring and Maintenance

### Health Checks

Monitor application health with the health check endpoint:

```bash
curl https://your-site.com/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00Z",
    "responseTime": "123ms",
    "checks": {
      "database": "ok",
      "api": "ok"
    }
  }
}
```

### Logging

Monitor logs in:

1. **Vercel**: Deployment logs and error tracking
2. **Supabase**: Database logs in **Settings** → **Logs**
3. **Application Console**: Server-side console logs

### Performance Monitoring

Enable in Vercel:

1. **Settings** → **Analytics**
2. Monitor Core Web Vitals
3. Track page load times and user experience

## Updating Production

### Deploy Changes

```bash
# Commit changes locally
git add .
git commit -m "Your changes"

# Push to main branch (automatically deploys to Vercel)
git push origin main
```

### Database Migrations

For database schema changes:

1. Test migrations locally
2. Apply in Supabase dashboard
3. Deploy code to Vercel

### Rollback Strategy

If issues occur:

1. Vercel automatically keeps previous deployments
2. Click "Rollback" in Vercel dashboard to revert code
3. Database changes may require manual migration

## Troubleshooting

### "Missing Supabase environment variables"

- Ensure `.env.local` has correct Supabase URL and keys
- Restart development server after changing env vars
- For Vercel: Check **Settings** → **Environment Variables**

### Database Connection Issues

- Verify Supabase project is active
- Check firewall/IP allowlist in Supabase
- Use `npm run setup:storage` to initialize buckets

### Authentication Not Working

- Confirm Supabase auth is enabled in project
- Check auth provider configuration
- Verify user email is confirmed in Supabase

### Rate Limiting Issues

- Rate limits are per IP address per endpoint
- Use `X-RateLimit-*` response headers to check quota
- Clear rate limit for testing: restart server (clears in-memory store)

## Performance Optimization

### Image Optimization

Currently disabled (`unoptimized: true`) to ensure compatibility. To enable:

1. Modify `next.config.ts`: Set `unoptimized: false`
2. Test thoroughly on preview deployment
3. Monitor for any display issues

### Caching Strategy

- Static assets: 1 year cache (files in `_next/static`)
- API responses: No caching (always fresh)
- Pages: 1 hour cache with validation

### Database Query Optimization

See `DATABASE_SCHEMA.md` for:
- Recommended indexes
- Optimized query patterns
- Performance considerations

## Support and Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

## Version History

- **v1.0**: Initial deployment
- **v1.1**: Added loyalty program (YaguaMillas)
- **v1.2**: Added educational content (articulos)
- **v1.3**: Improved security headers and API documentation
