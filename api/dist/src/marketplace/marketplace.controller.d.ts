import { MarketplaceService } from './marketplace.service';
export declare class MarketplaceController {
    private marketplaceService;
    constructor(marketplaceService: MarketplaceService);
    getCities(): Promise<import("../database/entities").City[]>;
    getBusinessTypes(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        displayOrder: number;
        businessCount: number;
    }[]>;
    getBusinesses(type?: string, businessTypeId?: string, cityId?: string, city?: string): Promise<import("../database/entities").Business[]>;
    getRestaurants(type?: string, businessTypeId?: string, cityId?: string, city?: string): Promise<import("../database/entities").Business[]>;
    getRestaurantMenu(slug: string): Promise<{
        business: {
            id: string;
            name: string;
            slug: string;
            description: string;
            logo: string;
            coverImage: string;
            phone: string;
            address: string;
            city: string;
            cities: import("../database/entities").City[];
            isFeatured: boolean;
            settings: import("../database/entities").BusinessSettings;
        };
        menu: import("../database/entities").Category[];
    }>;
    checkout(body: any): Promise<{
        customer: {
            id: string;
            name: string;
            phone: string;
            email: string;
            address: string;
        };
        businessPhone: string | null;
        businessName: string | null;
        id: string;
        businessId: string;
        clientOrderId: string;
        source: string;
        status: string;
        customerId: string;
        salesmanId: string;
        tableNumber: string;
        subtotal: number;
        tax: number;
        discount: number;
        deliveryFee: number;
        total: number;
        paymentMethod: string;
        paymentStatus: string;
        type: string;
        deliveryAddress: string;
        customerNotes: string;
        cancelReason: string;
        business: import("../database/entities").Business;
        salesman: import("../database/entities").User;
        items: import("../database/entities").OrderItem[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
