import { Business } from './business.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductAddon } from './product-addon.entity';
export declare class Product {
    id: string;
    businessId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isActive: boolean;
    business: Business;
    category: Category;
    variants: ProductVariant[];
    addons: ProductAddon[];
    createdAt: Date;
    updatedAt: Date;
}
