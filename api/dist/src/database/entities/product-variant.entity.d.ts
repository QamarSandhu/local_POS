import { Product } from './product.entity';
export declare class ProductVariant {
    id: string;
    productId: string;
    name: string;
    priceModifier: number;
    product: Product;
}
