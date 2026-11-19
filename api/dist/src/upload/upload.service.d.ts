import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    url: string;
    key: string;
    filename: string;
    mimetype: string;
    size: number;
}
export interface UploadableFile {
    fieldname?: string;
    originalname: string;
    encoding?: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class UploadService {
    private readonly configService;
    private readonly logger;
    private readonly storageDriver;
    private readonly localStoragePath;
    private readonly publicBaseUrl;
    private readonly supabaseUrl;
    private readonly serviceRoleKey;
    private readonly bucketName;
    constructor(configService: ConfigService);
    getStorageDriver(): string;
    getLocalStoragePath(): string;
    uploadImage(file: UploadableFile, subfolder?: string): Promise<UploadResult>;
    private uploadToLocalStorage;
    private uploadToSupabase;
}
