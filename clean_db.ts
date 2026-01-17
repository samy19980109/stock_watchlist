
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseService } from './src/lib/supabase';

async function main() {
    try {
        console.log('Deleting stocks with 0 price...');
        const { error, count } = await supabaseService
            .from('stocks')
            .delete({ count: 'exact' })
            .eq('current_price', 0);

        if (error) console.error('Error deleting:', error);
        else console.log(`Deleted ${count} rows with 0 price.`);

        // Also delete those with 0 PE just in case price was somehow valid but others weren't?
        // Actually, let's just delete the specific symbols to be sure
        const symbols = ['ADBE', 'UNH', 'COST', 'NFLX', 'AMD', 'UBER'];
        const { error: err2 } = await supabaseService
            .from('stocks')
            .delete()
            .in('symbol', symbols);

        if (err2) console.error('Error deleting specific symbols:', err2);
        else console.log('Deleted specific symbols manually to force refresh.');

    } catch (e) {
        console.error(e);
    }
}

main();
