import { LicensingService } from './licensing.service';
import { PaymentService } from './payment.service';
export declare class LicensingController {
    private readonly licensingService;
    private readonly paymentService;
    constructor(licensingService: LicensingService, paymentService: PaymentService);
    private checkPlatformAccess;
    getStatus(req: any, queryBizId?: string): Promise<import("./licensing.service").LicenseStatusResponse>;
    activateLicense(req: any, body: {
        licenseKey: string;
    }): Promise<import("./licensing.service").LicenseStatusResponse>;
    getAdminLicenses(req: any, businessId?: string): Promise<import("../database/entities").License[]>;
    generateLicense(req: any, body: {
        businessId: string;
        durationMonths?: number;
        expiresAt?: string;
        notes?: string;
        installationId?: string;
    }): Promise<import("../database/entities").License>;
    renewLicense(req: any, id: string, body: {
        durationMonths?: number;
        expiresAt?: string;
        notes?: string;
    }): Promise<import("../database/entities").License>;
    getAdminPayments(req: any, businessId?: string): Promise<import("../database/entities").PaymentRecord[]>;
    createPayment(req: any, body: {
        businessId: string;
        licenseId?: string;
        amount: number;
        paymentMethod: string;
        referenceNumber?: string;
        status?: string;
        notes?: string;
    }): Promise<import("../database/entities").PaymentRecord>;
    updatePaymentStatus(req: any, id: string, body: {
        status: 'PAID' | 'REJECTED' | 'REFUNDED' | 'PENDING';
        notes?: string;
    }): Promise<import("../database/entities").PaymentRecord>;
}
