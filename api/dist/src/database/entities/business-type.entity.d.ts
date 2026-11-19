import { Business } from './business.entity';
export declare class BusinessType {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    displayOrder: number;
    businesses: Business[];
    createdAt: Date;
    updatedAt: Date;
}
