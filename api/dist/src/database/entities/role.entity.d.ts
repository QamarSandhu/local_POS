import { BusinessMembership } from './business-membership.entity';
export declare class Role {
    id: string;
    name: string;
    permissions: string[];
    memberships: BusinessMembership[];
}
