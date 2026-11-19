import { Repository } from 'typeorm';
import { Business } from '../database/entities/business.entity';
import { User } from '../database/entities/user.entity';
import { Order } from '../database/entities/order.entity';
import { BusinessMembership } from '../database/entities/business-membership.entity';
import { BusinessBilling } from '../database/entities/business-billing.entity';
import { BusinessType } from '../database/entities/business-type.entity';
import { BackupService } from './backup.service';
import { CitiesService } from '../cities/cities.service';
export declare class AdminService {
    private businessRepo;
    private userRepo;
    private orderRepo;
    private membershipRepo;
    private billingRepo;
    private businessTypeRepo;
    private backupService;
    private citiesService;
    constructor(businessRepo: Repository<Business>, userRepo: Repository<User>, orderRepo: Repository<Order>, membershipRepo: Repository<BusinessMembership>, billingRepo: Repository<BusinessBilling>, businessTypeRepo: Repository<BusinessType>, backupService: BackupService, citiesService: CitiesService);
    getStats(): Promise<{
        totalBusinesses: number;
        activeBusinesses: number;
        totalUsers: number;
        totalOrders: number;
        posOrders: number;
        marketplaceOrders: number;
        totalSales: number;
    }>;
    getBusinesses(): Promise<{
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
    toggleBusinessStatus(id: string, isActive: boolean, suspendReason?: string): Promise<Business>;
    toggleBusinessFeatured(id: string, isFeatured: boolean): Promise<Business>;
    updateBusiness(id: string, dto: {
        name?: string;
        businessTypeId?: string;
        pricingPlan?: string;
    }): Promise<Business>;
    resetBusinessPassword(businessId: string, newPassword: string): Promise<{
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
    getUsers(): Promise<User[]>;
    createPlatformUser(dto: {
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
        memberships: BusinessMembership[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleUserStatus(id: string, isActive: boolean, currentAdminId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        isSuperAdmin: boolean;
        platformRole: string;
        isActive: boolean;
        memberships: BusinessMembership[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetUserPassword(id: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getOrders(limit?: number): Promise<Order[]>;
    getBillingOverview(cycle?: string): Promise<{
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
    updateBillingStatus(businessId: string, cycle: string, dto: {
        status: 'PAID' | 'UNPAID';
        paymentMethod?: string;
        notes?: string;
        amountPaid?: number;
    }): Promise<BusinessBilling>;
    getBusinessTypes(): Promise<{
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
    createBusinessType(dto: {
        name: string;
        slug?: string;
        description?: string;
        icon?: string;
        displayOrder?: number;
        isActive?: boolean;
    }): Promise<BusinessType>;
    updateBusinessType(id: string, dto: {
        name?: string;
        slug?: string;
        description?: string;
        icon?: string;
        displayOrder?: number;
        isActive?: boolean;
    }): Promise<BusinessType>;
    toggleBusinessTypeStatus(id: string, isActive: boolean): Promise<BusinessType>;
    getCities(): Promise<{
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
    createCity(dto: any): Promise<import("../database/entities").City>;
    updateCity(id: string, dto: any): Promise<import("../database/entities").City>;
    toggleCityStatus(id: string, isActive: boolean): Promise<import("../database/entities").City>;
    createSystemBackup(): Promise<import("./backup.service").GeneratedBackup>;
    cleanupBackupFile(filePath: string): void;
}
