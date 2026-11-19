import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/auth.dto';
import { Business } from '../database/entities/business.entity';
import { BusinessMembership } from '../database/entities/business-membership.entity';
import { City } from '../database/entities/city.entity';
import { Repository } from 'typeorm';
export declare class AuthService {
    private usersService;
    private jwtService;
    private businessRepository;
    private membershipsRepository;
    private cityRepository;
    constructor(usersService: UsersService, jwtService: JwtService, businessRepository: Repository<Business>, membershipsRepository: Repository<BusinessMembership>, cityRepository: Repository<City>);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            isSuperAdmin: boolean;
            platformRole: any;
            roleId: any;
            activeBusinessId: any;
            activeBusinessName: any;
            activeBusinessSlug: any;
            activeBusinessIsActive: any;
            activeBusinessPricingPlan: any;
            activeBusinessTypeId: any;
            activeBusinessType: {
                id: any;
                name: any;
                slug: any;
                icon: any;
            } | null;
            businessTypeSlug: any;
        };
        requiresBusinessSelection: boolean;
        memberships: any;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            isSuperAdmin: boolean;
            platformRole: any;
            roleId: any;
            activeBusinessId: any;
            activeBusinessName: any;
            activeBusinessSlug: any;
            activeBusinessIsActive: any;
            activeBusinessPricingPlan: any;
            activeBusinessTypeId: any;
            activeBusinessType: {
                id: any;
                name: any;
                slug: any;
                icon: any;
            } | null;
            businessTypeSlug: any;
        };
        requiresBusinessSelection: boolean;
        memberships: any;
    }>;
    selectBusiness(userId: string, businessId: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            isSuperAdmin: boolean;
            roleId: string;
            activeBusinessId: string;
            activeBusinessName: string | null;
            activeBusinessSlug: string | null;
            activeBusinessIsActive: boolean;
            activeBusinessPricingPlan: string;
            activeBusinessTypeId: string | null;
            activeBusinessType: {
                id: string;
                name: string;
                slug: string;
                icon: string | null;
            } | null;
            businessTypeSlug: string;
        };
    }>;
    signup(signupDto: SignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            isSuperAdmin: boolean;
            platformRole: any;
            roleId: any;
            activeBusinessId: any;
            activeBusinessName: any;
            activeBusinessSlug: any;
            activeBusinessIsActive: any;
            activeBusinessPricingPlan: any;
            activeBusinessTypeId: any;
            activeBusinessType: {
                id: any;
                name: any;
                slug: any;
                icon: any;
            } | null;
            businessTypeSlug: any;
        };
        requiresBusinessSelection: boolean;
        memberships: any;
    }>;
    bootstrapSuperAdmin(dto: {
        name: string;
        email: string;
        password: string;
        setupSecret?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            isSuperAdmin: boolean;
            platformRole: any;
            roleId: any;
            activeBusinessId: any;
            activeBusinessName: any;
            activeBusinessSlug: any;
            activeBusinessIsActive: any;
            activeBusinessPricingPlan: any;
            activeBusinessTypeId: any;
            activeBusinessType: {
                id: any;
                name: any;
                slug: any;
                icon: any;
            } | null;
            businessTypeSlug: any;
        };
        requiresBusinessSelection: boolean;
        memberships: any;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
        password?: string;
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
    getProfile(userId: string): Promise<{
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
}
