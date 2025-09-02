# Next.js + TypeScript + Supabase Debug Report
_Generated: 2025-09-01T18:28:35.902146_
_Project: /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream_

## Executive Summary
**🔵 No critical blockers**

- **Summary:** No critical issues found in high-level checks.
- **Recommendation:** Address warnings and infos to improve robustness.


## Environment
**🔵 Node.js detected**

- **Summary:** Node version: v24.7.0
- **Recommendation:** Ensure Node.js version meets Next.js requirements (typically LTS).
- **Evidence:** `v24.7.0`

**🔵 Supabase CLI detected**

- **Summary:** Supabase CLI version: 2.39.2
- **Recommendation:** Keep Supabase CLI up to date for local dev and migrations.
- **Evidence:** `2.39.2`

**🔵 Git repository detected**

- **Summary:** Project is inside a Git repository.
- **Recommendation:** Use branches and conventional commits to track changes.

**Notes:**
- Detected package manager: npm

## Project Structure
**🔵 middleware.ts present**

- **Summary:** Middleware detected.
- **Recommendation:** Ensure auth and rewrites are intentional and tested.

**🔵 Prettier config not found**

- **Summary:** Prettier isn't configured (optional but recommended).
- **Recommendation:** Add Prettier for formatting consistency.

**Notes:**
- Routing dirs — app/: True, pages/: False
- API routes found: 11

## Dependency Health
**Notes:**
- next version: ^15.5.2
- typescript version: ^5
- @supabase/supabase-js version: ^2.56.0

## TypeScript Configuration
**🔵 jsx setting not optimized**

- **Summary:** `compilerOptions.jsx` is `preserve`.
- **Recommendation:** Use `react-jsx` for modern JSX transform.

**Notes:**
- Using tsconfig.json

## Next.js Configuration
**Notes:**
- Using next.config.ts
- Images domain configuration detected.
- Experimental flags detected; validate compatibility.
- Standalone output detected (good for Docker).

## Supabase Integration
**Notes:**
- Env files present: .env.local
- Anon key exp: 2035-08-23T07:41:57Z
- REST probe status: 200
- Files referencing supabase-js: 139

## Tooling Run Results
**🟠 TypeScript typecheck failed**

- **Summary:** > figdream@0.1.0 typecheck
> tsc --noEmit

src/app/(customer)/loyalty/page.tsx(112,36): error TS2339: Property 'current_tier' does not exist on type '{ success: boolean; data: CustomerLoyalty; error?: undefined; } | { success: boolean; error: string; data?: undefined; }'.
  Property 'current_tier' does not exist on type '{ success: boolean; data: CustomerLoyalty; error?: undefined; }'.
src/app/(customer)/loyalty/page.tsx(113,33): error TS2339: Property 'next_tier' does not exist on type '{ succe
- **Recommendation:** Investigate TypeScript typecheck output for errors.

**🟠 ESLint failed**

- **Summary:** > figdream@0.1.0 lint
> eslint


/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/app/(customer)/appointments/[id]/page.tsx
   30:3   error  'ArrowLeft' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  144:87  error  Unexpected any. Specify a different type                                     @typescript-eslint/no-explicit-any
  148:89  error  Unexpected any. Specify a different type                            
- **Recommendation:** Investigate ESLint output for errors.

**🟠 Next.js build failed**

- **Summary:** Failed to compile.

src/app/(customer)/appointments/[id]/page.tsx
You cannot have two parallel pages that resolve to the same path. Please check /(customer)/appointments/[id]/page and /(staff)/appointments/[id]/page. Refer to the route group docs for more information: https://nextjs.org/docs/app/building-your-application/routing/route-groups

src/app/(customer)/appointments/page.tsx
You cannot have two parallel pages that resolve to the same path. Please check /(customer)/appointments/page and /
- **Recommendation:** Investigate Next.js build output for errors.

