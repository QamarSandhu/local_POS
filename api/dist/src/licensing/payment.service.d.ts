import { Repository } from 'typeorm';
import { PaymentRecord } from '../database/entities/payment-record.entity';
import { Business } from '../database/entities/business.entity';
export declare class PaymentService {
    private readonly paymentRepo;
    private readonly businessRepo;
    constructor(paymentRepo: Repository<PaymentRecord>, businessRepo: Repository<Business>);
    createPayment(dto: {
        businessId: string;
        licenseId?: string;
        amount: number;
        paymentMethod: string;
        referenceNumber?: string;
        status?: string;
        notes?: string;
    }): Promise<PaymentRecord>;
    updatePaymentStatus(id: string, status: 'PAID' | 'REJECTED' | 'REFUNDED' | 'PENDING', adminId?: string, notes?: string): Promise<PaymentRecord>;
    getPayments(query?: {
        businessId?: string;
        status?: string;
    }): Promise<PaymentRecord[]>;
}
