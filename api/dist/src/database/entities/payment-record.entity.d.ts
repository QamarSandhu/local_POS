import { Business } from './business.entity';
import { License } from './license.entity';
export declare class PaymentRecord {
    id: string;
    businessId: string;
    business?: Business;
    licenseId: string | null;
    license?: License | null;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    referenceNumber: string | null;
    status: string;
    notes: string | null;
    confirmedAt: Date | null;
    confirmedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
