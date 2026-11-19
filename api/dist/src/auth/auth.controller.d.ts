import { AuthService } from './auth.service';
import { LoginDto, SignupDto, BusinessSelectDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
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
    bootstrapSuperAdmin(body: {
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
    selectBusiness(req: any, body: BusinessSelectDto): Promise<{
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
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, body: {
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
        memberships: import("../database/entities").BusinessMembership[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
