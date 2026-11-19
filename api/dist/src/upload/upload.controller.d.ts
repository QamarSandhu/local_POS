import { UploadService, UploadResult, UploadableFile } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: UploadableFile, folder?: string): Promise<UploadResult>;
}
