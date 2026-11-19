import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { ProductAddon } from '../database/entities/product-addon.entity';
export declare class ProductsService {
    private productsRepository;
    private variantsRepository;
    private addonsRepository;
    constructor(productsRepository: Repository<Product>, variantsRepository: Repository<ProductVariant>, addonsRepository: Repository<ProductAddon>);
    findAll(businessId: string): Promise<Product[]>;
    findOne(businessId: string, id: string): Promise<Product>;
    create(businessId: string, data: any): Promise<Product>;
    update(businessId: string, id: string, data: any): Promise<Product>;
    remove(businessId: string, id: string): Promise<Product>;
    createVariant(businessId: string, productId: string, data: Partial<ProductVariant>): Promise<ProductVariant>;
    removeVariant(businessId: string, productId: string, variantId: string): Promise<ProductVariant>;
    createAddon(businessId: string, productId: string, data: Partial<ProductAddon>): Promise<ProductAddon>;
    removeAddon(businessId: string, productId: string, addonId: string): Promise<ProductAddon>;
}
