import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { License } from '../database/entities/license.entity';
import { Business } from '../database/entities/business.entity';
export interface LicenseStatusResponse {
    isLicensed: boolean;
    status: 'ACTIVE' | 'NOT_ACTIVATED' | 'EXPIRED' | 'CLOCK_TAMPERED' | 'HOSTED';
    licenseNumber?: string;
    businessId?: string;
    businessName?: string;
    expiresAt?: string;
    issuedAt?: string;
    daysRemaining?: number;
    isWarning: boolean;
    warningLevel: 'NONE' | '3_DAYS' | '2_DAYS' | '1_DAY' | 'EXPIRED' | 'NOT_ACTIVATED' | 'CLOCK_TAMPERED';
    message?: string;
}
export declare class LicensingService {
    private readonly licenseRepo;
    private readonly businessRepo;
    private readonly configService;
    private readonly logger;
    private lastVerificationWrite;
    constructor(licenseRepo: Repository<License>, businessRepo: Repository<Business>, configService: ConfigService);
    getDeploymentMode(): string;
    isSelfHosted(): boolean;
    getPublicKey(): string;
    getPrivateKey(): string;
    generateLicense(dto: {
        businessId: string;
        durationMonths?: number;
        expiresAt?: string;
        notes?: string;
        installationId?: string;
    }): Promise<License>;
    getLicenses(query?: {
        businessId?: string;
        status?: string;
    }): Promise<License[]>;
    renewLicense(licenseId: string, dto: {
        durationMonths?: number;
        expiresAt?: string;
        notes?: string;
    }): Promise<License>;
    getActiveLicenseStatus(businessId?: string): Promise<LicenseStatusResponse>;
    activateLicense(licenseKey: string, businessId?: string): Promise<LicenseStatusResponse>;
    validateRequestLicense(businessId: string): Promise<boolean>;
}
