import { Response } from 'express';
import { UploadService } from './upload.service';
export declare class UploadsController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    serveFile(folder: string, filename: string, res: Response): void;
}
