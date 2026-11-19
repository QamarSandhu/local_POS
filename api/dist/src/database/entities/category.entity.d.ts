import { Business } from './business.entity';
import { Product } from './product.entity';
export declare class Category {
    id: string;
    businessId: string;
    name: string;
    order: number;
    business: Business;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
