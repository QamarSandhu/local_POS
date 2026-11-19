import { OrderItem } from './order-item.entity';
import { ProductAddon } from './product-addon.entity';
export declare class OrderItemAddon {
    id: string;
    orderItemId: string;
    addonId: string;
    price: number;
    orderItem: OrderItem;
    addon: ProductAddon;
}
