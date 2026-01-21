# Automated Backfill & Re-scoring

This guide outlines how to implement an automated nightly process to refresh fundamental data and re-calculate "Dip Scores" for all stocks in the database. This ensures the dashboard is always up-to-date when users log in.

## Objective
Automatically update the `stocks` table every night at a specific time (e.g., 2:00 AM EST) by fetching fresh data from Financial Modeling Prep (FMP) and recalculating metrics.

## Implementation Strategy: Supabase Edge Functions + Cron

Supabase provides built-in support for scheduled tasks via **Edge Functions** and the `pg_cron` extension.

### 1. Enable `pg_cron`
First, ensure the `pg_cron` extension is enabled in your Supabase project:
1. Go to **Database** -> **Extensions**.
2. Search for `pg_cron` and enable it (it should be in the `extensions` schema).

### 2. Create the Refresh Edge Function
Create a new Supabase Edge Function that will handle the logic:

```bash
supabase functions new refresh-stock-data
```

In `index.ts`, implement the logic to fetch and update:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Get all unique symbols from watchlist_items
  const { data: symbolsData } = await supabase
    .from('watchlist_items')
    .select('stock_symbol')

  const symbols = [...new Set(symbolsData?.map(s => s.stock_symbol))];

  if (symbols.length === 0) {
    return new Response("No symbols to refresh", { status: 200 })
  }

  // 2. Trigger the refresh logic
  // Note: It's best to call your existing backend logic
  // We recommend creating a dedicated internal API route for this
  const response = await fetch(`${Deno.env.get('APP_URL')}/api/internal/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('INTERNAL_SECRET')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ symbols })
  });

  return new Response(JSON.stringify({ refreshed: symbols.length }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### 3. Schedule the Cron Job
You can use SQL to schedule the Edge Function to run every night:

```sql
select
  cron.schedule(
    'refresh-stocks-nightly', -- name of the cron job
    '0 2 * * *',              -- every day at 02:00
    $$
    select
      net.http_post(
        url:='https://your-project-ref.functions.supabase.co/refresh-stock-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      );
    $$
  );
```

## Alternative: GitHub Actions
If you prefer not to use Supabase Edge Functions, you can use a GitHub Action with a cron trigger:

```yaml
name: Nightly Stock Refresh
on:
  schedule:
    - cron: '0 2 * * *' # 2 AM every day
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Refresh API
        run: |
          curl -X POST https://your-app.com/api/internal/refresh \
          -H "Authorization: Bearer ${{ secrets.INTERNAL_SECRET }}"
```

## Considerations

### Rate Limiting
FMP has rate limits on its API. Ensure your refresh logic (within `getStocksData`) handles this by:
- Using a small delay between requests (current implementation uses `Math.random() * 500`).
- Processing symbols in batches of 5-10 if the watchlist grows large.

### Data Staleness
The current `getStocksData` implementation has a 24-hour cache expiry (`CACHE_EXPIRY_MS`). The cron job ensures that even if no user visits the site, the cache is primed daily.

### Cost Basis & Re-scoring
When the stocks are "re-scored" during the backfill:
1. Current price is updated.
2. Fundamental ratios (PE, FCF Yield) are updated.
3. The `last_updated` timestamp is bumped.
4. Next earnings dates are refreshed.

### Optimization: Pre-calculating Scores
Currently, the "Dip Score" is calculated on the client side. To enable server-side filtering and lightning-fast sorting, you can:
1. Add a `dip_score` column to the `stocks` table:
   ```sql
   ALTER TABLE public.stocks ADD COLUMN dip_score INTEGER;
   ```
2. Update the `refresh-stock-data` function to calculate the score using the `calculateDipScore` logic and save it during the upsert.
3. Update your dashboard query to order by `dip_score` directly in the database.
