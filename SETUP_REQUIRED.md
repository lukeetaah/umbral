# SETUP REQUIRED — only human actions

All local functionality works without completing this file.

## 1. GitHub (only if Codex could not publish)

Install GitHub CLI from https://cli.github.com/ because `gh` is not present on this computer. Then run:

```bash
gh auth login
gh repo create umbral --public --source=. --remote=origin --push
```

Do not add repository secrets for the browser application.

## 2. Supabase Free

1. Sign in to Supabase and create a Free organization only if you do not already have one.
2. Create a Free project named `umbral`. Do not enable Pro, a Pro Trial, PITR, Branching, add-ons, Storage, or Realtime.
3. Copy **Project URL** and the **Publishable key** (never the service-role key).
4. Set Site URL to the final Vercel URL. Add `http://localhost:3000/account` and `https://YOUR-VERCEL-URL/account` to Redirect URLs.
5. Run `supabase/migrations/001_initial_schema.sql`, then `supabase/seed.sql`, using Supabase CLI or SQL Editor.
6. Create the first user through the `/account` page and obtain the UUID from Authentication → Users.
7. In SQL Editor, replace the placeholder and run exactly:

```sql
insert into public.user_roles (user_id, role)
values ('PASTE-AUTH-USER-UUID-HERE'::uuid, 'admin')
on conflict (user_id, role) do nothing;
```

No other personal data is required.

## 3. Vercel Hobby

1. Sign in to Vercel and stay on Hobby. Do not start a Pro Trial.
2. Import the public GitHub repository and confirm Framework Preset: **Next.js**.
3. Do not set `outputDirectory: out` and do not add paid add-ons or Blob.
4. Add only:

```text
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key>
NEXT_PUBLIC_APP_ENV=production
```

5. Deploy, copy the Vercel URL, and add its `/account` URL to Supabase Redirect URLs.

Never put a Supabase service-role key in Vercel or the browser.
