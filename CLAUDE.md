# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ADKcasting is a professional casting platform built as a monorepo with two main applications:
- **test2/**: Legacy Next.js 14 application (Pages Router) - Production app with 9000+ comedian profiles
- **adk-app/**: Modern Next.js 15 application (App Router) - New frontend rewrite using Tailwind v4

Both applications share a Supabase PostgreSQL backend with Row Level Security (RLS).

## Development Commands

### test2/ (Legacy/Production App)
```bash
cd test2
npm run dev          # Start dev server on :3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run migrate-db   # Run database migration helper
npm run test-migration    # Test migration scripts
npm run test-features     # Test new features
```

### adk-app/ (New App)
```bash
cd adk-app
npm run dev          # Start dev server with Turbopack on :3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Root-level
```bash
# Root package.json has limited scripts - work primarily in test2/ or adk-app/
npm install          # Install dependencies in both apps
```

## Critical: WordPress Data Format & PHP Serialization

**CRITICAL**: The database contains WordPress data imported from the old site. WordPress stores arrays as **PHP serialized strings**, not PostgreSQL arrays.

### Why PHP Serialization?
- ✅ Maintains compatibility with WordPress backend
- ✅ No need to migrate 9000+ existing profiles
- ✅ Serialization/deserialization functions already implemented

### Filter to Database Column Mapping

| Filter Name (Frontend) | Database Column (WordPress) | Format | Notes |
|------------------------|---------------------------|--------|-------|
| `wp_skills` | `wp_skills` | PHP serialized | ✅ 4942 records - Compétences diverses (Chant, Doublage, etc.) |
| `driving_licenses` | `actor_driving_license` | PHP serialized | ✅ 4107 records - Permis (Auto, Moto, Camion, Avion) |
| `languages` | `actor_languages_native` | PHP serialized | ✅ 7667 records - Langues maternelles |
| `languages_fluent` | `actor_languages_native` | PHP serialized | ✅ Same as languages - use same column |
| `nationality` | `actor_nationality` OR `nationality` | TEXT | ✅ Check both columns with OR |
| `experience_level` | `experience_level` | TEXT | ✅ 6952 records - More data than wp_experience |
| `desired_activities` | `wp_activity_domain` | PHP serialized | ⚠️ To verify - Long métrage, Court métrage, etc. |

### WordPress PHP Serialized Format

WordPress data is stored in PHP serialized format:
- Example: `a:1:{i:0;s:5:"Chant";}` = `["Chant"]`
- Example: `a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}` = `["Chant", "Doublage"]`

**When reading (display)**: Use `normalizeComedienData()` from `lib/wordpress-compat.ts`
```typescript
import { normalizeComedienData } from '@/lib/wordpress-compat'

// Automatically deserializes WordPress data
const normalized = normalizeComedienData(comedien)
console.log(normalized.diverse_skills_normalized) // ["Chant", "Doublage"]
```

**When writing (save)**: Use `phpSerialize()` from `lib/php-serialize.ts`
```typescript
import { phpSerialize } from '@/lib/php-serialize'

const dataToSave = {
  wp_skills: phpSerialize(["Chant", "Doublage"]),  // → "a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}"
  actor_driving_license: phpSerialize(["Auto"]),    // → "a:1:{i:0;s:4:"Auto";}"
}
```

**Search method**: Use PostgreSQL `ILIKE` to search within serialized data
```typescript
// Correct - searches in WordPress column with ILIKE
query = query.ilike('wp_skills', `%${skill}%`)

// Wrong - these columns are EMPTY
query = query.contains('diverse_skills', [skill])
```

### Empty Columns to NEVER Use

These columns were created by mistake and are EMPTY (0 records):
- ❌ `diverse_skills` - Use `wp_skills` instead
- ❌ `driving_licenses` (array) - Use `actor_driving_license` instead
- ❌ `languages` (array) - Use `actor_languages_native` instead
- ❌ `languages_fluent` (array) - Use `actor_languages_native` instead

### When Adding/Modifying Filters

1. Check which WordPress column contains the data using `test2/scripts/check-column-data.js`
2. Update `test2/types/index.ts` (ComedienFilters interface) with correct column mapping
3. Update `test2/components/ComedienFilters.tsx` UI component
4. Update `test2/pages/api/comediens.ts` with correct column name and ILIKE search
5. Remember: WordPress data uses PHP serialization, search with ILIKE not contains()

## Database Architecture

### Migration Workflow
Execute SQL scripts in Supabase SQL Editor in this order:
1. `test2/sql/schema.sql` - Core tables (comediens, user_profiles, films, admin_ratings)
2. `test2/sql/functions.sql` - Utility functions
3. `test2/sql/rls.sql` - Row Level Security policies
4. `test2/sql/migration_*.sql` - Feature migrations as needed

### WordPress Password Compatibility
- Legacy WordPress users can log in with original passwords
- Uses `test2/lib/wordpress-password.ts` for hash verification
- `test2/lib/wordpress-compat.ts` handles authentication flow
- See `test2/WORDPRESS_PASSWORD_MIGRATION.md` for details

### Photo Storage
- Photos stored in Supabase Storage bucket `comedien-photos`
- Migration scripts in `test2/scripts/migrate-wordpress-photos*.ts`
- Failed photo migrations tracked in `test2/logs/`

## Shared Type System

**All TypeScript types live in `test2/types/index.ts`** - This is the single source of truth for:
- `Comedien` - Complete comedian profile with WordPress legacy fields
- `ComedienFilters` - Search filter structure
- `User` - User authentication and roles
- `AdminRating` - Admin star ratings

Both apps import from this shared location.

## Authentication & Authorization

### Roles
- `public` - Browse comedians, view profiles
- `comedien` - Edit own profile via dashboard
- `admin` - Full access, star ratings, PDF export

### Key Files
- `test2/lib/auth.ts` - Authentication service
- `test2/components/AuthProvider.tsx` - Auth context provider
- `test2/components/AuthGuard.tsx` - Route protection
- `test2/pages/connexion.tsx` - Login page
- `test2/pages/nouveau-mot-de-passe.tsx` - Password reset
- `test2/sql/migration_add_reset_password.sql` - Reset token schema

## PDF Generation

Two implementations:
- `test2/lib/pdf.ts` - Complex multi-page PDF with full details
- `test2/lib/pdf-simple.ts` - Simplified version
- Admin-only feature via dashboard
- Uses jsPDF library

## Key Components (test2/)

### Comedian Management
- `components/ComedienCard.tsx` - Profile card display
- `components/ComedienFilters.tsx` - Advanced search filters
- `components/ProfileEditForm.tsx` - Profile editing (large form, 26KB)
- `components/InscriptionFormComplete.tsx` - Registration form (152KB, comprehensive)

### Layout & UI
- `components/Layout.tsx` - Shared layout wrapper
- `components/Header.tsx` - Navigation header
- `components/Footer.tsx` - Footer component
- `components/ui/` - Reusable UI primitives

### Admin Features
- `components/AdminStars.tsx` - Star rating system
- `pages/dashboard.tsx` - Admin/comedian dashboard

## Environment Variables

Both apps require `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Root also has `.env` for backend scripts.

## App Structure Differences

### test2/ (Pages Router)
```
test2/
├── pages/              # Next.js pages (index, comediens, dashboard, etc.)
├── pages/api/          # API routes
├── components/         # React components
├── lib/               # Services (supabase, auth, pdf)
├── styles/            # SCSS stylesheets
├── types/             # TypeScript types (SHARED)
├── sql/               # Database migrations
└── scripts/           # Utility scripts (photo migration, etc.)
```

### adk-app/ (App Router)
```
adk-app/
└── src/
    └── app/
        ├── comediens/      # Comedian routes
        ├── connexion/      # Login route
        ├── inscription/    # Registration route
        ├── mon-profil/     # Profile route
        ├── components/     # App-specific components
        ├── lib/           # App-specific utilities
        └── types/         # App-specific types
```

## Testing & Scripts

Notable utility scripts in `test2/scripts/`:
- `migrate-wordpress-photos.ts` - Photo migration from WordPress
- `migrate-wordpress-photos-parallel.ts` - Parallel photo migration
- `check-comedien-data.js` - Validate comedian data
- `check-wordpress-hash.ts` - Verify password hashes
- `retry-failed-photos.ts` - Retry failed photo migrations

## Common Development Patterns

1. **Adding a new comedien field**:
   - Add to `test2/types/index.ts` (Comedien interface)
   - Add SQL column via migration in `test2/sql/migration_*.sql`
   - Update `components/ProfileEditForm.tsx` for editing
   - Update `components/ComedienCard.tsx` for display
   - Update `components/InscriptionFormComplete.tsx` for registration

2. **Supabase queries**: Use client from `test2/lib/supabase.ts`
   ```typescript
   import { supabase } from '@/lib/supabase'
   const { data, error } = await supabase.from('comediens').select('*')
   ```

3. **Protected routes**: Wrap with `AuthGuard` component

4. **Accessing current user**: Use `AuthProvider` context

## Important Notes

- **Always verify filter mappings** when working with search/filters
- **RLS is enabled** - Test queries with appropriate user roles
- **WordPress legacy fields** exist for backward compatibility - see types
- **Photo URLs** use Supabase Storage, not WordPress paths
- **Both apps are active** - test2/ is production, adk-app/ is WIP
- **Type safety**: Always run `npm run type-check` before committing
