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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const path = require("path");
const fs = require("fs");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        const deploymentMode = this.configService.get('DEPLOYMENT_MODE', 'hosted');
        const configuredDriver = this.configService.get('STORAGE_DRIVER');
        this.storageDriver = configuredDriver || (deploymentMode === 'self-hosted' ? 'local' : 'supabase');
        this.localStoragePath = path.resolve(this.configService.get('LOCAL_STORAGE_PATH') || path.join(process.cwd(), 'storage', 'uploads'));
        const port = this.configService.get('PORT', 3001);
        this.publicBaseUrl = (this.configService.get('API_URL') ||
            this.configService.get('NEXT_PUBLIC_API_URL') ||
            `http://localhost:${port}`).replace(/\/+$/, '');
        this.supabaseUrl = this.configService.get('SUPABASE_URL', 'https://rsqsnnhfvbatcqzgafib.supabase.co');
        this.serviceRoleKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY', '');
        this.bucketName = this.configService.get('SUPABASE_BUCKET_NAME', 'user-uploads');
        if (this.storageDriver === 'local') {
            try {
                fs.mkdirSync(this.localStoragePath, { recursive: true });
                this.logger.log(`Local storage initialized at: ${this.localStoragePath}`);
            }
            catch (err) {
                this.logger.error(`Failed to initialize local storage path: ${err.message}`);
            }
        }
    }
    getStorageDriver() {
        return this.storageDriver;
    }
    getLocalStoragePath() {
        return this.localStoragePath;
    }
    async uploadImage(file, subfolder = 'general') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided for upload');
        }
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
        ];
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
            throw new common_1.BadRequestException(`Invalid file type "${file.mimetype}". Allowed types: JPEG, PNG, WebP, GIF, SVG.`);
        }
        const cleanSubfolder = path.basename(subfolder.replace(/[^a-zA-Z0-9_-]/g, '')) || 'general';
        const ext = path.extname(file.originalname) || '.jpg';
        const cleanOriginalName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);
        const uniqueId = (0, crypto_1.randomUUID)().slice(0, 8);
        const targetFilename = `${Date.now()}-${uniqueId}-${cleanOriginalName}${ext}`;
        if (this.storageDriver === 'local') {
            return this.uploadToLocalStorage(file, cleanSubfolder, targetFilename);
        }
        return this.uploadToSupabase(file, cleanSubfolder, targetFilename);
    }
    async uploadToLocalStorage(file, subfolder, filename) {
        try {
            const folderDir = path.join(this.localStoragePath, subfolder);
            await fs.promises.mkdir(folderDir, { recursive: true });
            const targetPath = path.join(folderDir, filename);
            await fs.promises.writeFile(targetPath, file.buffer);
            const publicUrl = `${this.publicBaseUrl}/uploads/${subfolder}/${filename}`;
            return {
                url: publicUrl,
                key: `local/${subfolder}/${filename}`,
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            };
        }
        catch (error) {
            this.logger.error(`Local upload failed: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Failed to save image locally: ${error.message}`);
        }
    }
    async uploadToSupabase(file, subfolder, filename) {
        const storagePath = `${subfolder}/${filename}`;
        const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`;
        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.serviceRoleKey}`,
                    'Content-Type': file.mimetype,
                },
                body: new Uint8Array(file.buffer),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Supabase Storage responded with ${response.status}: ${errorText}`);
            }
            const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storagePath}`;
            return {
                url: publicUrl,
                key: `${this.bucketName}/${storagePath}`,
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to upload image to storage: ${error.message}`);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map