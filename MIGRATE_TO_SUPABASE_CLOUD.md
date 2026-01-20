# Migrating to Supabase Cloud (Free Tier)

This guide explains how to migrate your local Supabase database and authentication setup to a hosted project on **Supabase Cloud**.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **New Project** and select your organization.
3. Choose a name, database password, and region (closest to your users).
4. Select the **Free Tier** ($0/month).
   - **Note**: The Free Tier includes 500MB database space, 5GB bandwidth, and up to 2 active projects.

## 2. Install Supabase CLI (If not already)

If you haven't installed it globally, you can use `npx`:

```bash
npx supabase login
```

## 3. Link Your Local Project

Link your local project to the remote project you just created. You will need your **Project ID** (found in Project Settings > General) and your **Database Password**.

```bash
npx supabase link --project-ref <your-project-id>
```

## 4. Push Migrations to Cloud

This command will apply all your local migrations (found in `supabase/migrations/`) to your remote database.

```bash
npx supabase db push
```

> [!IMPORTANT]
> This pushes the **schema** and **structure**. It does **not** push the local data (rows) by default.

## 5. Migrate Data (Optional)

If you have local data that you want to move to the cloud, you can use a dump and restore method:

1. **Dump local data**:
   ```bash
   npx supabase db dump --data-only > data.sql
   ```
2. **Apply to remote**:
   You can run the generated `data.sql` via the Supabase SQL Editor in the browser, or use `psql` if you have the connection string.

## 6. Update Environment Variables

Update your `.env.local` file with the credentials from your new Cloud project:

```env
# Get these from Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Service role is for server-side only
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## 7. Setup Authentication Providers

If you have Google, Apple, or other providers configured locally, you must re-configure them in the Cloud Console:

1. Go to **Authentication > Providers**.
2. Enable the providers you need.
3. For Google/Apple, you'll need to enter the **Client ID** and **Secret** again.
4. Update the **Site URL** and **Redirect URLs** in **Authentication > URL Configuration** to match your production domain (e.g., `https://your-app.vercel.app`).

## 8. Continuous Deployment (Recommended)

To automatically deploy changes in the future, you can set up GitHub Actions:

1. Follow the [Supabase GitHub Actions Guide](https://supabase.com/docs/guides/cli/github-actions).
2. Every time you push a new migration to GitHub, it will be automatically applied to your preview or production project.

---

### Free Tier Limitations to Keep in Mind:
- **Database Size**: 500MB.
- **Monthly Active Users (MAU)**: 50,000.
- **Edge Function Invocations**: 500,000.
- **Pause Policy**: Projects on the free tier may be paused after 1 week of inactivity. You can resume them from the dashboard.
