import { BusinessMembership } from './business-membership.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    phone: string;
    isSuperAdmin: boolean;
    platformRole: string;
    isActive: boolean;
    memberships: BusinessMembership[];
    createdAt: Date;
    updatedAt: Date;
}
