"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const businesses_module_1 = require("./businesses/businesses.module");
const memberships_module_1 = require("./memberships/memberships.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const reports_module_1 = require("./reports/reports.module");
const marketplace_module_1 = require("./marketplace/marketplace.module");
const admin_module_1 = require("./admin/admin.module");
const upload_module_1 = require("./upload/upload.module");
const contact_module_1 = require("./contact/contact.module");
const chatbot_module_1 = require("./chatbot/chatbot.module");
const cities_module_1 = require("./cities/cities.module");
const licensing_module_1 = require("./licensing/licensing.module");
const entities = require("./database/entities");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbUrl = configService.get('DATABASE_URL');
                    const deploymentMode = configService.get('DEPLOYMENT_MODE', 'hosted');
                    const isSelfHosted = deploymentMode === 'self-hosted';
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const syncTables = configService.get('DB_SYNCHRONIZE') === 'true';
                    const explicitSsl = configService.get('DB_SSL') === 'true';
                    const useSsl = !isSelfHosted && (dbUrl?.includes('sslmode=require') ||
                        explicitSsl ||
                        Boolean(dbUrl && isProduction));
                    const poolMax = parseInt(configService.get('DB_POOL_MAX', isSelfHosted ? '20' : '2'), 10);
                    if (dbUrl) {
                        return {
                            type: 'postgres',
                            url: dbUrl,
                            ssl: useSsl ? { rejectUnauthorized: false } : false,
                            entities: Object.values(entities),
                            synchronize: syncTables,
                            extra: {
                                max: poolMax,
                                connectionTimeoutMillis: 5000,
                            },
                        };
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USER', 'letsbuyit'),
                        password: configService.get('DB_PASSWORD', 'password123'),
                        database: configService.get('DB_NAME', 'letsbuyit_db'),
                        ssl: useSsl ? { rejectUnauthorized: false } : false,
                        entities: Object.values(entities),
                        synchronize: syncTables,
                        extra: {
                            max: poolMax,
                            connectionTimeoutMillis: 5000,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                entities.Role,
                entities.BusinessType,
                entities.Business,
                entities.City,
                entities.License,
                entities.PaymentRecord,
            ]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            businesses_module_1.BusinessesModule,
            memberships_module_1.MembershipsModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            reports_module_1.ReportsModule,
            marketplace_module_1.MarketplaceModule,
            admin_module_1.AdminModule,
            cities_module_1.CitiesModule,
            upload_module_1.UploadModule,
            contact_module_1.ContactModule,
            chatbot_module_1.ChatbotModule,
            licensing_module_1.LicensingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map