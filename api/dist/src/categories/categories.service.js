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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../database/entities/category.entity");
let CategoriesService = class CategoriesService {
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async findAll(businessId) {
        return this.categoriesRepository.find({
            where: { businessId },
            order: { order: 'ASC' },
            relations: ['products'],
        });
    }
    async findOne(businessId, id) {
        const category = await this.categoriesRepository.findOne({
            where: { id, businessId },
            relations: ['products'],
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async create(businessId, data) {
        const category = this.categoriesRepository.create({
            ...data,
            businessId,
        });
        return this.categoriesRepository.save(category);
    }
    async createBulk(businessId, names) {
        if (!names || !Array.isArray(names) || names.length === 0)
            return [];
        const existing = await this.categoriesRepository.find({ where: { businessId } });
        const existingNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));
        let maxOrder = existing.reduce((max, c) => Math.max(max, c.order || 0), 0);
        const toCreate = [];
        for (const rawName of names) {
            const trimmed = rawName?.trim();
            if (!trimmed || existingNames.has(trimmed.toLowerCase())) {
                continue;
            }
            maxOrder += 1;
            const cat = this.categoriesRepository.create({
                businessId,
                name: trimmed,
                order: maxOrder,
            });
            existingNames.add(trimmed.toLowerCase());
            toCreate.push(cat);
        }
        if (toCreate.length > 0) {
            await this.categoriesRepository.save(toCreate);
        }
        return this.findAll(businessId);
    }
    async update(businessId, id, data) {
        const category = await this.findOne(businessId, id);
        Object.assign(category, data);
        return this.categoriesRepository.save(category);
    }
    async remove(businessId, id) {
        const category = await this.findOne(businessId, id);
        return this.categoriesRepository.remove(category);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map