import { getOMXS30Performance, estimateMarketCap, getCompanySizeCategory } from "./yahoo-finance.js";
import { searchInsiderTrades, getNotableBuys } from "./fi-scraper.js";
import { scoreAndRank } from "./scoring.js";
async function main() {
    console.log("=== Test 1: OMXS30 Benchmark ===");
    try {
        const omx = await getOMXS30Performance("1mo");
        console.log(`OMXS30: ${omx.currentValue}, 30d change: ${omx.changePercent30d}%`);
    }
    catch (e) {
        console.log("OMXS30 failed:", e.message);
    }
    console.log("\n=== Test 2: Market Cap Estimation ===");
    for (const sym of ["PNDX-B.ST", "VOLV-B.ST", "PIER-B.ST"]) {
        try {
            const mc = await estimateMarketCap(sym);
            const cat = mc.marketCapSEK > 0 ? getCompanySizeCategory(mc.marketCapSEK) : "unknown";
            console.log(`${sym}: ${(mc.marketCapSEK / 1e9).toFixed(1)}B SEK (${cat}, ${mc.confidence})`);
        }
        catch (e) {
            console.log(`${sym}: failed — ${e.message}`);
        }
    }
    console.log("\n=== Test 3: FI Scraper (pagination) ===");
    const trades = await searchInsiderTrades({
        fromDate: "2026-03-01",
        toDate: "2026-03-28",
    });
    console.log(`Found ${trades.length} trades in March (with pagination)`);
    console.log("\n=== Test 4: Enriched scoring ===");
    const buys = await getNotableBuys({ minValueSEK: 50000 });
    const scored = await scoreAndRank(buys);
    console.log(`Top 3 scored trades:`);
    for (const s of scored.slice(0, 3)) {
        const val = Math.round(s.trade.volume * s.trade.price);
        console.log(`  [${s.totalScore}/10] ${s.trade.issuer} — ${s.trade.person}`);
        console.log(`    ${new Intl.NumberFormat("sv-SE").format(val)} SEK`);
        console.log(`    ${s.reasoning}`);
        console.log();
    }
    console.log("✅ All tests passed");
}
main().catch(console.error);
