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
var CitiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const city_entity_1 = require("../database/entities/city.entity");
const business_entity_1 = require("../database/entities/business.entity");
let CitiesService = CitiesService_1 = class CitiesService {
    constructor(cityRepository, businessRepository) {
        this.cityRepository = cityRepository;
        this.businessRepository = businessRepository;
        this.logger = new common_1.Logger(CitiesService_1.name);
    }
    async getActiveCities() {
        return this.cityRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async getAllCities() {
        const cities = await this.cityRepository.find({
            relations: ['businesses'],
            order: { name: 'ASC' },
        });
        return cities.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            isActive: c.isActive,
            latitude: c.latitude ? Number(c.latitude) : null,
            longitude: c.longitude ? Number(c.longitude) : null,
            country: c.country,
            businessCount: c.businesses ? c.businesses.length : 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));
    }
    async findById(id) {
        const city = await this.cityRepository.findOne({
            where: { id },
            relations: ['businesses'],
        });
        if (!city) {
            throw new common_1.NotFoundException('City not found');
        }
        return city;
    }
    async findBySlug(slug) {
        const city = await this.cityRepository.findOne({
            where: { slug: slug.toLowerCase() },
            relations: ['businesses'],
        });
        if (!city) {
            throw new common_1.NotFoundException('City not found');
        }
        return city;
    }
    async createCity(dto) {
        if (!dto.name || !dto.name.trim()) {
            throw new common_1.BadRequestException('City name is required');
        }
        const trimmedName = dto.name.trim();
        const slug = (dto.slug || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase().replace(/^-+|-+$/g, '');
        const existing = await this.cityRepository.findOne({
            where: [{ name: trimmedName }, { slug }],
        });
        if (existing) {
            throw new common_1.ConflictException('City with this name or slug already exists');
        }
        const city = this.cityRepository.create({
            name: trimmedName,
            slug,
            isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
            latitude: dto.latitude !== undefined ? Number(dto.latitude) : null,
            longitude: dto.longitude !== undefined ? Number(dto.longitude) : null,
            country: dto.country?.trim() || 'Pakistan',
        });
        return this.cityRepository.save(city);
    }
    async updateCity(id, dto) {
        const city = await this.findById(id);
        if (dto.name && dto.name.trim()) {
            const trimmedName = dto.name.trim();
            const existingName = await this.cityRepository
                .createQueryBuilder('city')
                .where('LOWER(city.name) = LOWER(:name) AND city.id != :id', {
                name: trimmedName,
                id,
            })
                .getOne();
            if (existingName) {
                throw new common_1.BadRequestException('City with this name already exists');
            }
            city.name = trimmedName;
        }
        if (dto.slug && dto.slug.trim()) {
            const slug = dto.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const existingSlug = await this.cityRepository
                .createQueryBuilder('city')
                .where('city.slug = :slug AND city.id != :id', {
                slug,
                id,
            })
                .getOne();
            if (existingSlug) {
                throw new common_1.BadRequestException('City with this slug already exists');
            }
            city.slug = slug;
        }
        if (dto.isActive !== undefined) {
            city.isActive = Boolean(dto.isActive);
        }
        if (dto.latitude !== undefined) {
            city.latitude = dto.latitude !== null ? Number(dto.latitude) : null;
        }
        if (dto.longitude !== undefined) {
            city.longitude = dto.longitude !== null ? Number(dto.longitude) : null;
        }
        if (dto.country !== undefined) {
            city.country = dto.country?.trim() || 'Pakistan';
        }
        return this.cityRepository.save(city);
    }
    async toggleCityStatus(id, isActive) {
        const city = await this.findById(id);
        city.isActive = Boolean(isActive);
        return this.cityRepository.save(city);
    }
    async ensureDefaultCities() {
        const defaultCities = [
            {
                name: 'Mandi Bahauddin',
                slug: 'mandi-bahauddin',
                isActive: true,
                latitude: 32.5870,
                longitude: 73.4912,
                country: 'Pakistan',
            },
            {
                name: 'Lahore',
                slug: 'lahore',
                isActive: false,
                latitude: 31.5204,
                longitude: 74.3587,
                country: 'Pakistan',
            },
            {
                name: 'Islamabad',
                slug: 'islamabad',
                isActive: false,
                latitude: 33.6844,
                longitude: 73.0479,
                country: 'Pakistan',
            },
            {
                name: 'Karachi',
                slug: 'karachi',
                isActive: false,
                latitude: 24.8607,
                longitude: 67.0011,
                country: 'Pakistan',
            },
        ];
        try {
            for (const dc of defaultCities) {
                let city = await this.cityRepository.findOne({ where: { slug: dc.slug } });
                if (!city) {
                    city = this.cityRepository.create(dc);
                    await this.cityRepository.save(city);
                    this.logger.log(`Initialized city: ${dc.name} (${dc.isActive ? 'Active' : 'Inactive'})`);
                }
            }
            const mandiBahauddin = await this.cityRepository.findOne({ where: { slug: 'mandi-bahauddin' } });
            const lahore = await this.cityRepository.findOne({ where: { slug: 'lahore' } });
            if (mandiBahauddin) {
                const businesses = await this.businessRepository.find({ relations: ['cities'] });
                for (const biz of businesses) {
                    const currentCityIds = (biz.cities || []).map((c) => c.id);
                    const shouldAddMandi = !biz.cities ||
                        biz.cities.length === 0 ||
                        (biz.city && biz.city.toLowerCase().includes('mandi'));
                    const shouldAddLahore = lahore && biz.city && biz.city.toLowerCase().includes('lahore');
                    let changed = false;
                    const updatedCities = [...(biz.cities || [])];
                    if (shouldAddMandi && !currentCityIds.includes(mandiBahauddin.id)) {
                        updatedCities.push(mandiBahauddin);
                        changed = true;
                    }
                    if (shouldAddLahore && lahore && !currentCityIds.includes(lahore.id)) {
                        updatedCities.push(lahore);
                        changed = true;
                    }
                    if (changed) {
                        biz.cities = updatedCities;
                        await this.businessRepository.save(biz);
                        this.logger.log(`Associated business "${biz.name}" with initial city associations.`);
                    }
                }
            }
        }
        catch (err) {
            this.logger.error(`Error ensuring default cities: ${err.message}`);
        }
    }
};
exports.CitiesService = CitiesService;
exports.CitiesService = CitiesService = CitiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CitiesService);
//# sourceMappingURL=cities.service.js.map