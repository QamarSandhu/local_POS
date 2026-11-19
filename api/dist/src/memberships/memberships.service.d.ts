import { Repository } from 'typeorm';
import { BusinessMembership } from '../database/entities/business-membership.entity';
import { UsersService } from '../users/users.service';
export declare class MembershipsService {
    private membershipsRepository;
    private usersService;
    constructor(membershipsRepository: Repository<BusinessMembership>, usersService: UsersService);
    getStaff(businessId: string): Promise<BusinessMembership[]>;
    getSalesmen(businessId: string): Promise<{
        id: string;
        name: string;
        email: string;
        roleId: string;
        roleName: string;
    }[]>;
    createStaff(businessId: string, data: {
        name: string;
        email: string;
        phone?: string;
        roleId: string;
        password?: string;
    }): Promise<BusinessMembership>;
    inviteStaff(businessId: string, email: string, roleId: string): Promise<BusinessMembership>;
    updateStaffRole(businessId: string, membershipId: string, roleId: string): Promise<BusinessMembership>;
    updateStaff(businessId: string, membershipId: string, data: {
        name?: string;
        phone?: string;
        roleId?: string;
        password?: string;
    }): Promise<BusinessMembership | null>;
    removeStaff(businessId: string, membershipId: string): Promise<BusinessMembership>;
}
