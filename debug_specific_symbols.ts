
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const { getStocksData } = await import('./src/lib/fmp');
        const symbols = ['ADBE', 'UNH', 'COST', 'NFLX', 'AMD', 'UBER'];

        console.log(`Fetching data for: ${symbols.join(', ')}`);
        const data = await getStocksData(symbols);

        data.forEach(d => {
            console.log(`Symbol: ${d.symbol}`);
            console.log(`  Price: ${d.price}`);
            console.log(`  PE: ${d.pe}`);
            console.log(`  FCF Yield: ${d.fcfYield}`);
            // Check if it looks like a failure
            if (d.price === 0 && d.pe === 0) {
                console.log('  -> LOOKS FAILED (Zeroed data)');
            } else {
                console.log('  -> LOOKS VALID');
            }
        });

    } catch (e) {
        console.error(e);
    }
}

main();
