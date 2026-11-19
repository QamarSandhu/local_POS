import { Business } from './business.entity';
export declare class License {
    id: string;
    licenseNumber: string;
    licenseKey: string;
    businessId: string;
    business?: Business;
    businessName: string;
    plan: string;
    issuedAt: Date;
    expiresAt: Date;
    isActive: boolean;
    status: string;
    lastVerifiedAt: Date | null;
    signature: string;
    installationId: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
