import { Product } from './product.entity';
export declare class ProductAddon {
    id: string;
    productId: string;
    name: string;
    price: number;
    product: Product;
}
