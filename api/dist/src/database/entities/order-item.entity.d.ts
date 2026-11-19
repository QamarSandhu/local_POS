import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { OrderItemAddon } from './order-item-addon.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    order: Order;
    product: Product;
    variant: ProductVariant;
    addons: OrderItemAddon[];
}
