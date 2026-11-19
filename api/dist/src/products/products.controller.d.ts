import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(req: any): Promise<import("../database/entities").Product[]>;
    findOne(req: any, id: string): Promise<import("../database/entities").Product>;
    create(req: any, body: any): Promise<import("../database/entities").Product>;
    update(req: any, id: string, body: any): Promise<import("../database/entities").Product>;
    remove(req: any, id: string): Promise<import("../database/entities").Product>;
    createVariant(req: any, productId: string, body: any): Promise<import("../database/entities").ProductVariant>;
    removeVariant(req: any, productId: string, variantId: string): Promise<import("../database/entities").ProductVariant>;
    createAddon(req: any, productId: string, body: any): Promise<import("../database/entities").ProductAddon>;
    removeAddon(req: any, productId: string, addonId: string): Promise<import("../database/entities").ProductAddon>;
}
