import { Business } from './business.entity';
export declare class BusinessSettings {
    businessId: string;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    codEnabled: boolean;
    minimumOrder: number;
    minimumDeliveryOrder: number;
    deliveryCharges: number;
    freeDeliveryThreshold: number | null;
    deliveryRadius: number;
    taxPercentage: number;
    orderColumns: string[];
    business: Business;
}
