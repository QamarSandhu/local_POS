import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export interface GeneratedBackup {
    filePath: string;
    filename: string;
    sizeBytes: number;
}
export type BackupToolType = {
    type: 'NATIVE';
    binPath: string;
} | {
    type: 'DATASOURCE';
} | {
    type: 'NONE';
};
export declare class BackupService {
    private configService;
    private dataSource?;
    private readonly logger;
    constructor(configService: ConfigService, dataSource?: DataSource | undefined);
    createDatabaseBackup(): Promise<GeneratedBackup>;
    private generateBackupFilename;
    detectBackupTool(): BackupToolType;
    private runNativePgDump;
    private runDataSourceBackup;
    cleanupFile(filePath: string): void;
}
