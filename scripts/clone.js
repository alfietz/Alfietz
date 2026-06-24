import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Load your live cloud variables
dotenv.config(); 

// 1. The RX Line (Source: Turso Cloud)
// Convert https:// to libsql:// for better compatibility
let sourceUrl = process.env.TURSO_URL;
if (sourceUrl.startsWith('https://')) {
    sourceUrl = sourceUrl.replace('https://', 'libsql://');
}
const sourceDb = createClient({
    url: sourceUrl, 
    authToken: process.env.TURSO_AUTH_TOKEN
});

// 2. The TX Line (Destination: Local Offline File)
const localDb = createClient({
    url: "file:local.db"
});

async function runDMATransfer() {
    console.log("🚀 Initializing DMA Transfer from Cloud to Local SRAM...");

    try {
        // Disable foreign key constraints during transfer
        await localDb.execute("PRAGMA foreign_keys = OFF");

        // Query the system table to map out the entire memory architecture
        const schemaRes = await sourceDb.execute("SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        const tables = schemaRes.rows;

        for (const table of tables) {
            const tableName = table.name;
            const tableSchema = table.sql;

            console.log(`\n📦 Flashing module: ${tableName}`);

            // Wipe existing local allocation and format the new table
            await localDb.execute(`DROP TABLE IF EXISTS ${tableName}`);
            await localDb.execute(tableSchema);

            // Read all registers from the Cloud
            const dataRes = await sourceDb.execute(`SELECT * FROM ${tableName}`);
            const rows = dataRes.rows;
            const columns = dataRes.columns;

            if (rows.length === 0) {
                console.log(`   └─ 0 bytes found. Table formatted.`);
                continue;
            }

            // Construct the dynamic SQL opcode for writing
            const placeholders = columns.map(() => '?').join(', ');
            const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

            // Package the data into a high-speed batch buffer
            const statements = rows.map(row => ({
                sql: insertSql,
                args: columns.map(col => row[col])
            }));

            // Flush the buffer to local disk
            await localDb.batch(statements, "write");
            console.log(`   └─ Successfully transferred ${rows.length} rows.`);
        }

        // Re-enable foreign key constraints
        await localDb.execute("PRAGMA foreign_keys = ON");

        console.log("\n✅ DMA Transfer Complete! Your local circuit is fully loaded.");
        
    } catch (error) {
        console.error("\n❌ Segmentation Fault during transfer:", error);
    }
}

// Execute the hardware subroutine
runDMATransfer();
