import { MembershipsService } from './memberships.service';
export declare class MembershipsController {
    private membershipsService;
    constructor(membershipsService: MembershipsService);
    getStaff(req: any): Promise<import("../database/entities").BusinessMembership[]>;
    getSalesmen(req: any): Promise<{
        id: string;
        name: string;
        email: string;
        roleId: string;
        roleName: string;
    }[]>;
    createStaff(req: any, body: {
        name: string;
        email: string;
        phone?: string;
        roleId: string;
        password?: string;
    }): Promise<import("../database/entities").BusinessMembership>;
    inviteStaff(req: any, body: {
        email: string;
        roleId: string;
    }): Promise<import("../database/entities").BusinessMembership>;
    updateRole(req: any, id: string, body: {
        roleId: string;
    }): Promise<import("../database/entities").BusinessMembership>;
    updateStaff(req: any, id: string, body: {
        name?: string;
        phone?: string;
        roleId?: string;
        password?: string;
    }): Promise<import("../database/entities").BusinessMembership | null>;
    removeStaff(req: any, id: string): Promise<import("../database/entities").BusinessMembership>;
}
