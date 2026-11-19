import { Response } from 'express';
import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    private checkPlatformAccess;
    private checkSuperAdmin;
    getStats(req: any): Promise<{
        totalBusinesses: number;
        activeBusinesses: number;
        totalUsers: number;
        totalOrders: number;
        posOrders: number;
        marketplaceOrders: number;
        totalSales: number;
    }>;
    getBusinesses(req: any): Promise<{
        id: string;
        name: string;
        slug: string;
        logo: string;
        coverImage: string;
        businessTypeId: string | null;
        businessType: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
        } | null;
        isActive: boolean;
        pricingPlan: string;
        posPrintsCount: number;
        activatedAt: Date;
        suspendReason: string | null;
        isFeatured: boolean;
        featuredUntil: Date;
        ownerUserId: string | null;
        ownerName: string;
        ownerEmail: string;
        totalOrders: number;
        totalSales: number;
        createdAt: Date;
    }[]>;
    toggleStatus(req: any, id: string, body: {
        isActive: boolean;
        suspendReason?: string;
    }): Promise<import("../database/entities").Business>;
    toggleFeatured(req: any, id: string, body: {
        isFeatured: boolean;
    }): Promise<import("../database/entities").Business>;
    updateBusiness(req: any, id: string, body: {
        name?: string;
        businessTypeId?: string;
        pricingPlan?: string;
    }): Promise<import("../database/entities").Business>;
    resetBusinessPassword(req: any, id: string, body: {
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
        business: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    getUsers(req: any): Promise<import("../database/entities").User[]>;
    createPlatformUser(req: any, body: {
        name: string;
        email: string;
        password: string;
        role: 'SUPER_ADMIN' | 'PLATFORM_MANAGER';
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        isSuperAdmin: boolean;
        platformRole: string;
        isActive: boolean;
        memberships: import("../database/entities").BusinessMembership[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleUserStatus(req: any, id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        isSuperAdmin: boolean;
        platformRole: string;
        isActive: boolean;
        memberships: import("../database/entities").BusinessMembership[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetUserPassword(req: any, id: string, body: {
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getOrders(req: any, limit?: string): Promise<import("../database/entities").Order[]>;
    getBillingOverview(req: any, cycle?: string): Promise<{
        cycle: string;
        availableCycles: string[];
        summary: {
            totalBilled: number;
            totalCollected: number;
            totalPending: number;
            totalPrints: number;
            paidCount: number;
            unpaidCount: number;
            totalBusinesses: number;
        };
        invoices: {
            id: string;
            businessId: string;
            businessName: string;
            slug: string;
            logo: string;
            isActive: boolean;
            plan: string;
            ownerName: string;
            ownerEmail: string;
            phone: string;
            city: string;
            printsCount: number;
            amountDue: number;
            amountPaid: number;
            status: string;
            paidAt: Date | null;
            paymentMethod: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    updateBillingStatus(req: any, businessId: string, body: {
        cycle: string;
        status: 'PAID' | 'UNPAID';
        amountPaid?: number;
        paymentMethod?: string;
        notes?: string;
    }): Promise<import("../database/entities").BusinessBilling>;
    getBusinessTypes(req: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        isActive: boolean;
        displayOrder: number;
        businessCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createBusinessType(req: any, body: any): Promise<import("../database/entities").BusinessType>;
    updateBusinessType(req: any, id: string, body: any): Promise<import("../database/entities").BusinessType>;
    toggleBusinessTypeStatus(req: any, id: string, body: {
        isActive: boolean;
    }): Promise<import("../database/entities").BusinessType>;
    getCities(req: any): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        country: string;
        businessCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createCity(req: any, body: any): Promise<import("../database/entities").City>;
    updateCity(req: any, id: string, body: any): Promise<import("../database/entities").City>;
    toggleCityStatus(req: any, id: string, body: {
        isActive: boolean;
    }): Promise<import("../database/entities").City>;
    exportSystemData(req: any, res: Response): Promise<void>;
}
