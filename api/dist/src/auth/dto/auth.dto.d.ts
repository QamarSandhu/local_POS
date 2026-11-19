export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SignupDto {
    name: string;
    email: string;
    password: string;
    businessName: string;
    cityId: string;
    cityIds?: string[];
    pricingPlan?: string;
    businessTypeId?: string;
}
export declare class BusinessSelectDto {
    businessId: string;
}
