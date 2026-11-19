"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const data_source_1 = require("../../data-source");
async function runMigrations() {
    console.log('Initializing database connection for migrations...');
    if (!data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.initialize();
    }
    console.log('Executing pending migrations...');
    const migrations = await data_source_1.AppDataSource.runMigrations();
    if (migrations.length === 0) {
        console.log('No pending migrations to run. Database is up to date.');
    }
    else {
        console.log(`Successfully applied ${migrations.length} migration(s):`);
        for (const m of migrations) {
            console.log(` - ${m.name}`);
        }
    }
    await data_source_1.AppDataSource.destroy();
    console.log('Database connection closed.');
    return migrations;
}
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Migration execution failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=migration-runner.js.map