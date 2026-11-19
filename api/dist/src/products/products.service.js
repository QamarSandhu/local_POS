"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../database/entities/product.entity");
const product_variant_entity_1 = require("../database/entities/product-variant.entity");
const product_addon_entity_1 = require("../database/entities/product-addon.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository, variantsRepository, addonsRepository) {
        this.productsRepository = productsRepository;
        this.variantsRepository = variantsRepository;
        this.addonsRepository = addonsRepository;
    }
    async findAll(businessId) {
        return this.productsRepository.find({
            where: { businessId },
            relations: ['variants', 'addons'],
        });
    }
    async findOne(businessId, id) {
        const product = await this.productsRepository.findOne({
            where: { id, businessId },
            relations: ['variants', 'addons'],
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(businessId, data) {
        const { variants, addons, ...productData } = data;
        const product = this.productsRepository.create({
            ...productData,
            businessId,
        });
        const savedProduct = await this.productsRepository.save(product);
        if (variants && variants.length > 0) {
            const newVariants = variants.map((v) => this.variantsRepository.create({ ...v, productId: savedProduct.id }));
            await this.variantsRepository.save(newVariants);
        }
        if (addons && addons.length > 0) {
            const newAddons = addons.map((a) => this.addonsRepository.create({ ...a, productId: savedProduct.id }));
            await this.addonsRepository.save(newAddons);
        }
        return this.findOne(businessId, savedProduct.id);
    }
    async update(businessId, id, data) {
        const product = await this.findOne(businessId, id);
        const { variants, addons, ...productData } = data;
        Object.assign(product, productData);
        await this.productsRepository.save(product);
        if (variants !== undefined && Array.isArray(variants)) {
            const existingVariants = await this.variantsRepository.find({ where: { productId: id } });
            const keptIds = [];
            for (const v of variants) {
                if (!v || !v.name || !v.name.trim())
                    continue;
                const vName = v.name.trim();
                const priceModifier = parseFloat(v.priceModifier) || 0;
                let matched = v.id ? existingVariants.find((ev) => ev.id === v.id) : null;
                if (!matched) {
                    matched = existingVariants.find((ev) => ev.name.trim().toLowerCase() === vName.toLowerCase() && !keptIds.includes(ev.id));
                }
                if (matched) {
                    matched.name = vName;
                    matched.priceModifier = priceModifier;
                    await this.variantsRepository.save(matched);
                    keptIds.push(matched.id);
                }
                else {
                    const created = this.variantsRepository.create({
                        productId: id,
                        name: vName,
                        priceModifier,
                    });
                    const saved = await this.variantsRepository.save(created);
                    keptIds.push(saved.id);
                }
            }
            const toRemove = existingVariants.filter((ev) => !keptIds.includes(ev.id));
            for (const rem of toRemove) {
                try {
                    await this.productsRepository.query(`UPDATE order_items SET "variantId" = NULL WHERE "variantId" = $1`, [rem.id]);
                    await this.variantsRepository.delete(rem.id);
                }
                catch (delErr) {
                    console.warn(`Could not delete variant ${rem.id}:`, delErr);
                }
            }
        }
        if (addons !== undefined && Array.isArray(addons)) {
            const existingAddons = await this.addonsRepository.find({ where: { productId: id } });
            const keptIds = [];
            for (const a of addons) {
                if (!a || !a.name || !a.name.trim())
                    continue;
                const aName = a.name.trim();
                const price = parseFloat(a.price) || 0;
                let matched = a.id ? existingAddons.find((ea) => ea.id === a.id) : null;
                if (!matched) {
                    matched = existingAddons.find((ea) => ea.name.trim().toLowerCase() === aName.toLowerCase() && !keptIds.includes(ea.id));
                }
                if (matched) {
                    matched.name = aName;
                    matched.price = price;
                    await this.addonsRepository.save(matched);
                    keptIds.push(matched.id);
                }
                else {
                    const created = this.addonsRepository.create({
                        productId: id,
                        name: aName,
                        price,
                    });
                    const saved = await this.addonsRepository.save(created);
                    keptIds.push(saved.id);
                }
            }
            const toRemove = existingAddons.filter((ea) => !keptIds.includes(ea.id));
            for (const rem of toRemove) {
                try {
                    await this.productsRepository.query(`DELETE FROM order_item_addons WHERE "addonId" = $1`, [rem.id]);
                    await this.addonsRepository.delete(rem.id);
                }
                catch (delErr) {
                    console.warn(`Could not delete addon ${rem.id}:`, delErr);
                }
            }
        }
        return this.findOne(businessId, id);
    }
    async remove(businessId, id) {
        const product = await this.findOne(businessId, id);
        return this.productsRepository.remove(product);
    }
    async createVariant(businessId, productId, data) {
        await this.findOne(businessId, productId);
        const variant = this.variantsRepository.create({ ...data, productId });
        return this.variantsRepository.save(variant);
    }
    async removeVariant(businessId, productId, variantId) {
        await this.findOne(businessId, productId);
        const variant = await this.variantsRepository.findOne({ where: { id: variantId, productId } });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
        return this.variantsRepository.remove(variant);
    }
    async createAddon(businessId, productId, data) {
        await this.findOne(businessId, productId);
        const addon = this.addonsRepository.create({ ...data, productId });
        return this.addonsRepository.save(addon);
    }
    async removeAddon(businessId, productId, addonId) {
        await this.findOne(businessId, productId);
        const addon = await this.addonsRepository.findOne({ where: { id: addonId, productId } });
        if (!addon)
            throw new common_1.NotFoundException('Addon not found');
        return this.addonsRepository.remove(addon);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(product_addon_entity_1.ProductAddon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map