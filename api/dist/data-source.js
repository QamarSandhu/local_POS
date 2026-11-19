"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const entities = require("./src/database/entities");
dotenv.config();
const isSelfHosted = process.env.DEPLOYMENT_MODE === 'self-hosted';
const dbUrl = process.env.DATABASE_URL;
const explicitSsl = process.env.DB_SSL === 'true';
const sslModeInUrl = dbUrl?.includes('sslmode=require') || dbUrl?.includes('sslmode=verify-full');
const useSsl = !isSelfHosted && (sslModeInUrl || explicitSsl || (Boolean(dbUrl) && process.env.NODE_ENV === 'production'));
const caCertPath = process.env.DB_CA_CERT_PATH || './ca.pem';
const sslConfig = useSsl
    ? fs.existsSync(caCertPath)
        ? {
            ca: fs.readFileSync(caCertPath, 'utf8'),
            rejectUnauthorized: true,
        }
        : { rejectUnauthorized: false }
    : false;
const isTsExecution = __filename.endsWith('.ts');
const migrationsPath = isTsExecution
    ? path.join(__dirname, 'src/database/migrations/*.ts')
    : path.join(__dirname, 'src/database/migrations/*.js');
exports.AppDataSource = new typeorm_1.DataSource(dbUrl
    ? {
        type: 'postgres',
        url: dbUrl,
        ssl: sslConfig,
        entities: Object.values(entities),
        migrations: [migrationsPath],
        synchronize: false,
    }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'letsbuyit',
        password: process.env.DB_PASSWORD || 'password123',
        database: process.env.DB_NAME || 'letsbuyit_db',
        ssl: sslConfig,
        entities: Object.values(entities),
        migrations: [migrationsPath],
        synchronize: false,
    });
//# sourceMappingURL=data-source.js.map