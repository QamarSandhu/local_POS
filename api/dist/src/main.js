"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const express = require("express");
const path = require("path");
const fs = require("fs");
const compressionPkg = require("compression");
const compression = compressionPkg.default || compressionPkg;
let server = null;
let isInitialized = false;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(compression());
    app.enableCors();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3001;
    const storagePath = configService.get('LOCAL_STORAGE_PATH') || path.resolve(process.cwd(), 'storage/uploads');
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    app.use('/uploads', express.static(storagePath));
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
if (!process.env.VERCEL) {
    bootstrap();
}
async function handler(req, res) {
    if (!server) {
        const createExpress = express.default || express;
        server = createExpress();
        server.use(compression());
    }
    if (!isInitialized) {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
        app.use(compression());
        app.enableCors();
        await app.init();
        isInitialized = true;
    }
    return server(req, res);
}
//# sourceMappingURL=main.js.map