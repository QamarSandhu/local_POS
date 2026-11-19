"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
let BackupService = BackupService_1 = class BackupService {
    constructor(configService, dataSource) {
        this.configService = configService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(BackupService_1.name);
    }
    async createDatabaseBackup() {
        const filename = this.generateBackupFilename();
        const tempFilePath = path.join(os.tmpdir(), `letsbuyit-backup-${Date.now()}-${Math.random().toString(36).substring(7)}.dump`);
        const dbUrl = this.configService.get('DATABASE_URL');
        const dbHost = this.configService.get('DB_HOST', 'localhost');
        const dbPort = this.configService.get('DB_PORT', 5432);
        const dbUser = this.configService.get('DB_USER', 'letsbuyit');
        const dbPassword = this.configService.get('DB_PASSWORD', 'password123');
        const dbName = this.configService.get('DB_NAME', 'letsbuyit_db');
        this.logger.log(`Starting database backup generation: ${filename}`);
        const tool = this.detectBackupTool();
        if (tool.type === 'NONE') {
            throw new common_1.InternalServerErrorException('Database connection is not available for backup generation. Please verify your DATABASE_URL configuration.');
        }
        try {
            if (tool.type === 'NATIVE') {
                this.logger.log(`Using native pg_dump binary: ${tool.binPath}`);
                this.runNativePgDump(tool.binPath, tempFilePath, { dbUrl, dbHost, dbPort, dbUser, dbPassword, dbName });
            }
            else {
                this.logger.log(`Using direct Neon / PostgreSQL database connection (TypeORM DataSource) for backup generation`);
                await this.runDataSourceBackup(tempFilePath);
            }
            if (!fs.existsSync(tempFilePath)) {
                throw new Error('Backup file was not created.');
            }
            const stat = fs.statSync(tempFilePath);
            if (stat.size === 0) {
                throw new Error('Generated backup file is empty (0 bytes).');
            }
            if (tool.type === 'NATIVE') {
                const fd = fs.openSync(tempFilePath, 'r');
                const headerBuf = Buffer.alloc(5);
                fs.readSync(fd, headerBuf, 0, 5, 0);
                fs.closeSync(fd);
                if (headerBuf.toString('utf-8') !== 'PGDMP') {
                    throw new Error('Generated file does not match PostgreSQL custom dump format (PGDMP header missing).');
                }
            }
            this.logger.log(`Database backup generated successfully: ${filename} (${stat.size} bytes)`);
            return {
                filePath: tempFilePath,
                filename,
                sizeBytes: stat.size,
            };
        }
        catch (err) {
            this.cleanupFile(tempFilePath);
            this.logger.error(`Failed to generate database backup: ${err.message}`);
            throw new common_1.InternalServerErrorException(`Database backup generation failed: ${err.message}`);
        }
    }
    generateBackupFilename() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const min = pad(now.getMinutes());
        return `letsbuyit-system-backup-${yyyy}-${mm}-${dd}-${hh}-${min}.dump`;
    }
    detectBackupTool() {
        if (process.env.VERCEL && this.dataSource && this.dataSource.isInitialized) {
            return { type: 'DATASOURCE' };
        }
        const customPath = process.env.PG_DUMP_PATH;
        if (customPath && fs.existsSync(customPath)) {
            return { type: 'NATIVE', binPath: customPath };
        }
        try {
            const res = (0, child_process_1.spawnSync)('pg_dump', ['--version'], { stdio: 'ignore' });
            if (res.status === 0)
                return { type: 'NATIVE', binPath: 'pg_dump' };
        }
        catch {
        }
        const candidatePaths = [
            '/usr/bin/pg_dump',
            '/usr/local/bin/pg_dump',
            '/usr/lib/postgresql/17/bin/pg_dump',
            '/usr/lib/postgresql/16/bin/pg_dump',
            '/usr/lib/postgresql/15/bin/pg_dump',
            '/usr/lib/postgresql/14/bin/pg_dump',
            '/opt/homebrew/bin/pg_dump',
            'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
        ];
        for (const cand of candidatePaths) {
            try {
                if (fs.existsSync(cand)) {
                    const res = (0, child_process_1.spawnSync)(cand, ['--version'], { stdio: 'ignore' });
                    if (res.status === 0)
                        return { type: 'NATIVE', binPath: cand };
                }
            }
            catch {
            }
        }
        if (this.dataSource && this.dataSource.isInitialized) {
            return { type: 'DATASOURCE' };
        }
        return { type: 'NONE' };
    }
    runNativePgDump(pgDumpCmd, tempFilePath, config) {
        const args = ['-Fc', '-f', tempFilePath];
        if (config.dbUrl) {
            args.push('-d', config.dbUrl);
        }
        else {
            args.push('-h', config.dbHost, '-p', String(config.dbPort), '-U', config.dbUser, '-d', config.dbName);
        }
        const res = (0, child_process_1.spawnSync)(pgDumpCmd, args, {
            env: {
                ...process.env,
                PGPASSWORD: config.dbPassword,
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        if (res.status !== 0) {
            const stderr = res.stderr ? res.stderr.toString('utf-8') : 'Unknown error';
            throw new Error(stderr || `pg_dump exited with code ${res.status}`);
        }
    }
    async runDataSourceBackup(tempFilePath) {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            throw new Error('Active database connection is not available for backup generation.');
        }
        const writeStream = fs.createWriteStream(tempFilePath, { encoding: 'utf-8' });
        writeStream.write(`--\n`);
        writeStream.write(`-- Let's Buy It Database Backup (Neon / PostgreSQL Direct Export)\n`);
        writeStream.write(`-- Generated: ${new Date().toISOString()}\n`);
        writeStream.write(`-- Environment: Serverless / Cloud Database Export\n`);
        writeStream.write(`--\n\n`);
        writeStream.write(`SET statement_timeout = 0;\n`);
        writeStream.write(`SET client_encoding = 'UTF8';\n`);
        writeStream.write(`SET standard_conforming_strings = on;\n\n`);
        writeStream.write(`BEGIN;\n\n`);
        const tablesResult = await this.dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);
        const tableNames = tablesResult.map((r) => r.table_name);
        this.logger.log(`Database backup exporting ${tableNames.length} tables: ${tableNames.join(', ')}`);
        for (const tableName of tableNames) {
            writeStream.write(`--\n-- Table: public."${tableName}"\n--\n`);
            const rows = await this.dataSource.query(`SELECT * FROM "public"."${tableName}";`);
            if (rows.length > 0) {
                const columns = Object.keys(rows[0]);
                const colsSql = columns.map((c) => `"${c}"`).join(', ');
                for (const row of rows) {
                    const valuesSql = columns
                        .map((col) => {
                        const val = row[col];
                        if (val === null || val === undefined)
                            return 'NULL';
                        if (typeof val === 'number')
                            return String(val);
                        if (typeof val === 'boolean')
                            return val ? 'TRUE' : 'FALSE';
                        if (val instanceof Date)
                            return `'${val.toISOString()}'`;
                        if (typeof val === 'object') {
                            const jsonStr = JSON.stringify(val).replace(/'/g, "''");
                            return `'${jsonStr}'::jsonb`;
                        }
                        const strVal = String(val).replace(/'/g, "''");
                        return `'${strVal}'`;
                    })
                        .join(', ');
                    writeStream.write(`INSERT INTO "public"."${tableName}" (${colsSql}) VALUES (${valuesSql});\n`);
                }
            }
            writeStream.write('\n');
        }
        writeStream.write(`--\n-- Synchronize Primary Key Sequences\n--\n`);
        writeStream.write(`
DO $$
DECLARE
  seq_record RECORD;
BEGIN
  FOR seq_record IN 
    SELECT c.relname AS seq_name, t.relname AS table_name, a.attname AS col_name
    FROM pg_class c
    JOIN pg_depend d ON d.objid = c.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON (d.refobjid = a.attrelid AND d.refobjsubid = a.attnum)
    WHERE c.relkind = 'S'
  LOOP
    EXECUTE format('SELECT setval(%L, coalesce(max(%I), 1), max(%I) IS NOT NULL) FROM %I',
      seq_record.seq_name, seq_record.col_name, seq_record.col_name, seq_record.table_name);
  END LOOP;
END $$;
\n`);
        writeStream.write(`COMMIT;\n`);
        await new Promise((resolve, reject) => {
            writeStream.end(() => resolve());
            writeStream.on('error', reject);
        });
    }
    cleanupFile(filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (err) {
            this.logger.warn(`Could not clean up temporary file ${filePath}: ${err.message}`);
        }
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.DataSource])
], BackupService);
//# sourceMappingURL=backup.service.js.map