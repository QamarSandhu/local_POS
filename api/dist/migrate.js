"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migration_runner_1 = require("./src/database/migration-runner");
(0, migration_runner_1.runMigrations)()
    .then(() => {
    process.exit(0);
})
    .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map