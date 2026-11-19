import { User } from './user.entity';
import { Business } from './business.entity';
import { Role } from './role.entity';
export declare class BusinessMembership {
    id: string;
    userId: string;
    businessId: string;
    roleId: string;
    status: string;
    user: User;
    business: Business;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
