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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const business_entity_1 = require("../database/entities/business.entity");
const user_entity_1 = require("../database/entities/user.entity");
const order_entity_1 = require("../database/entities/order.entity");
const business_membership_entity_1 = require("../database/entities/business-membership.entity");
const business_billing_entity_1 = require("../database/entities/business-billing.entity");
const business_type_entity_1 = require("../database/entities/business-type.entity");
const backup_service_1 = require("./backup.service");
const cities_service_1 = require("../cities/cities.service");
let AdminService = class AdminService {
    constructor(businessRepo, userRepo, orderRepo, membershipRepo, billingRepo, businessTypeRepo, backupService, citiesService) {
        this.businessRepo = businessRepo;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.membershipRepo = membershipRepo;
        this.billingRepo = billingRepo;
        this.businessTypeRepo = businessTypeRepo;
        this.backupService = backupService;
        this.citiesService = citiesService;
    }
    async getStats() {
        const totalBusinesses = await this.businessRepo.count();
        const activeBusinesses = await this.businessRepo.count({ where: { isActive: true } });
        const totalUsers = await this.userRepo.count();
        const totalOrders = await this.orderRepo.count();
        const posOrders = await this.orderRepo.count({ where: { source: 'POS' } });
        const marketplaceOrders = await this.orderRepo.count({ where: { source: 'MARKETPLACE' } });
        const totalSalesRaw = await this.orderRepo
            .createQueryBuilder('order')
            .where('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' })
            .select('SUM(order.total)', 'sum')
            .getRawOne();
        const totalSales = parseFloat(totalSalesRaw?.sum || '0');
        return {
            totalBusinesses,
            activeBusinesses,
            totalUsers,
            totalOrders,
            posOrders,
            marketplaceOrders,
            totalSales,
        };
    }
    async getBusinesses() {
        const businesses = await this.businessRepo.find({
            relations: ['memberships', 'memberships.user', 'memberships.role', 'businessType'],
            order: { createdAt: 'DESC' },
        });
        const result = [];
        for (const b of businesses) {
            const orderCount = await this.orderRepo.count({ where: { businessId: b.id } });
            const salesRaw = await this.orderRepo
                .createQueryBuilder('o')
                .where('o.businessId = :businessId', { businessId: b.id })
                .andWhere('o.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
                .andWhere('o.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
                .andWhere('o.paymentStatus = :paidStatus', { paidStatus: 'PAID' })
                .select('SUM(o.total)', 'sum')
                .getRawOne();
            const ownerMembership = b.memberships?.find(m => m.roleId === 'BUSINESS_OWNER');
            result.push({
                id: b.id,
                name: b.name,
                slug: b.slug,
                logo: b.logo,
                coverImage: b.coverImage,
                businessTypeId: b.businessTypeId,
                businessType: b.businessType ? {
                    id: b.businessType.id,
                    name: b.businessType.name,
                    slug: b.businessType.slug,
                    icon: b.businessType.icon,
                } : null,
                isActive: b.isActive,
                pricingPlan: b.pricingPlan || 'PAY_PER_PRINT',
                posPrintsCount: b.posPrintsCount || 0,
                activatedAt: b.activatedAt,
                suspendReason: b.suspendReason || null,
                isFeatured: b.isFeatured,
                featuredUntil: b.featuredUntil,
                ownerUserId: ownerMembership?.user?.id || null,
                ownerName: ownerMembership?.user?.name || 'Unassigned',
                ownerEmail: ownerMembership?.user?.email || 'N/A',
                totalOrders: orderCount,
                totalSales: parseFloat(salesRaw?.sum || '0'),
                createdAt: b.createdAt,
            });
        }
        return result;
    }
    async toggleBusinessStatus(id, isActive, suspendReason) {
        const business = await this.businessRepo.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        business.isActive = isActive;
        if (isActive) {
            if (!business.activatedAt)
                business.activatedAt = new Date();
            business.suspendReason = null;
        }
        else {
            business.suspendReason = suspendReason || 'Suspended by platform administrator';
        }
        return this.businessRepo.save(business);
    }
    async toggleBusinessFeatured(id, isFeatured) {
        const business = await this.businessRepo.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        business.isFeatured = isFeatured;
        return this.businessRepo.save(business);
    }
    async updateBusiness(id, dto) {
        const business = await this.businessRepo.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        if (dto.name)
            business.name = dto.name;
        if (dto.businessTypeId !== undefined)
            business.businessTypeId = dto.businessTypeId || null;
        if (dto.pricingPlan)
            business.pricingPlan = dto.pricingPlan;
        return this.businessRepo.save(business);
    }
    async resetBusinessPassword(businessId, newPassword) {
        if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
            throw new common_1.BadRequestException('New password must be at least 6 characters long');
        }
        const business = await this.businessRepo.findOne({
            where: { id: businessId },
            relations: ['memberships', 'memberships.user'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        const ownerMembership = business.memberships?.find((m) => m.roleId === 'BUSINESS_OWNER' && m.user);
        const targetUser = ownerMembership?.user || business.memberships?.find((m) => m.user)?.user;
        if (!targetUser) {
            throw new common_1.NotFoundException(`No owner or associated user account found for business "${business.name}"`);
        }
        const salt = await bcrypt.genSalt();
        targetUser.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
        await this.userRepo.save(targetUser);
        return {
            success: true,
            message: `Password for "${business.name}" (${targetUser.email}) has been reset successfully.`,
            business: {
                id: business.id,
                name: business.name,
            },
            user: {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
            },
        };
    }
    async getUsers() {
        return this.userRepo.find({
            relations: ['memberships', 'memberships.business', 'memberships.role'],
            order: { createdAt: 'DESC' },
            select: ['id', 'name', 'email', 'phone', 'isSuperAdmin', 'platformRole', 'isActive', 'createdAt'],
        });
    }
    async createPlatformUser(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const isSuperAdmin = dto.role === 'SUPER_ADMIN';
        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            isSuperAdmin,
            platformRole: dto.role,
            isActive: true,
        });
        const saved = await this.userRepo.save(user);
        const { passwordHash: _, ...result } = saved;
        return result;
    }
    async toggleUserStatus(id, isActive, currentAdminId) {
        if (id === currentAdminId) {
            throw new common_1.BadRequestException('You cannot change active status on your own admin account');
        }
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.isActive = isActive;
        const saved = await this.userRepo.save(user);
        const { passwordHash: _, ...result } = saved;
        return result;
    }
    async resetUserPassword(id, newPassword) {
        if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
            throw new common_1.BadRequestException('New password must be at least 6 characters long');
        }
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
        await this.userRepo.save(user);
        return { success: true, message: `Password for ${user.email} updated successfully` };
    }
    async getOrders(limit = 50) {
        return this.orderRepo.find({
            relations: ['business', 'customer', 'salesman'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getBillingOverview(cycle) {
        const now = new Date();
        const currentCycle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const targetCycle = cycle || currentCycle;
        const rawCycles = await this.billingRepo
            .createQueryBuilder('b')
            .select('DISTINCT(b.billingCycle)', 'cycle')
            .orderBy('cycle', 'DESC')
            .getRawMany();
        const existingCycles = rawCycles.map(r => r.cycle).filter(Boolean);
        const availableCyclesSet = new Set([currentCycle, ...existingCycles]);
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const c = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            availableCyclesSet.add(c);
        }
        const availableCycles = Array.from(availableCyclesSet).sort().reverse();
        const businesses = await this.businessRepo.find({
            relations: ['memberships', 'memberships.user', 'memberships.role'],
            order: { createdAt: 'DESC' },
        });
        const billings = await this.billingRepo.find({
            where: { billingCycle: targetCycle },
        });
        const billingMap = new Map();
        billings.forEach(b => billingMap.set(b.businessId, b));
        const invoices = [];
        for (const b of businesses) {
            let billing = billingMap.get(b.id);
            const plan = b.pricingPlan || 'PAY_PER_PRINT';
            if (!billing) {
                const initialDue = plan === 'MONTHLY_FIXED' ? 3000 : 0;
                try {
                    billing = this.billingRepo.create({
                        businessId: b.id,
                        billingCycle: targetCycle,
                        plan,
                        printsCount: 0,
                        amountDue: initialDue,
                        amountPaid: 0,
                        status: 'UNPAID',
                    });
                    billing = await this.billingRepo.save(billing);
                }
                catch {
                    const found = await this.billingRepo.findOne({
                        where: { businessId: b.id, billingCycle: targetCycle },
                    });
                    if (found)
                        billing = found;
                }
            }
            if (!billing)
                continue;
            const ownerMembership = b.memberships?.find(m => m.roleId === 'BUSINESS_OWNER');
            invoices.push({
                id: billing.id,
                businessId: b.id,
                businessName: b.name,
                slug: b.slug,
                logo: b.logo,
                isActive: b.isActive,
                plan: billing.plan || plan,
                ownerName: ownerMembership?.user?.name || 'Unassigned',
                ownerEmail: ownerMembership?.user?.email || 'N/A',
                phone: b.phone || '',
                city: b.city || '',
                printsCount: billing.printsCount || 0,
                amountDue: Number(billing.amountDue || 0),
                amountPaid: Number(billing.amountPaid || 0),
                status: billing.status || 'UNPAID',
                paidAt: billing.paidAt,
                paymentMethod: billing.paymentMethod,
                notes: billing.notes,
                createdAt: billing.createdAt,
                updatedAt: billing.updatedAt,
            });
        }
        const totalBilled = invoices.reduce((acc, curr) => acc + curr.amountDue, 0);
        const totalCollected = invoices.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.amountPaid : 0), 0);
        const totalPending = invoices.reduce((acc, curr) => acc + (curr.status !== 'PAID' ? curr.amountDue : 0), 0);
        const totalPrints = invoices.reduce((acc, curr) => acc + curr.printsCount, 0);
        const paidCount = invoices.filter(i => i.status === 'PAID').length;
        const unpaidCount = invoices.filter(i => i.status !== 'PAID').length;
        return {
            cycle: targetCycle,
            availableCycles,
            summary: {
                totalBilled,
                totalCollected,
                totalPending,
                totalPrints,
                paidCount,
                unpaidCount,
                totalBusinesses: businesses.length,
            },
            invoices,
        };
    }
    async updateBillingStatus(businessId, cycle, dto) {
        let billing = await this.billingRepo.findOne({
            where: { businessId, billingCycle: cycle },
        });
        if (!billing) {
            const business = await this.businessRepo.findOne({ where: { id: businessId } });
            if (!business)
                throw new common_1.NotFoundException('Business not found');
            const plan = business.pricingPlan || 'PAY_PER_PRINT';
            const initialDue = plan === 'MONTHLY_FIXED' ? 3000 : 0;
            billing = this.billingRepo.create({
                businessId,
                billingCycle: cycle,
                plan,
                printsCount: 0,
                amountDue: initialDue,
                amountPaid: 0,
                status: 'UNPAID',
            });
        }
        if (dto.status === 'PAID') {
            billing.status = 'PAID';
            billing.paidAt = new Date();
            billing.amountPaid = dto.amountPaid !== undefined ? Number(dto.amountPaid) : Number(billing.amountDue);
            billing.paymentMethod = dto.paymentMethod || 'BANK_TRANSFER';
            if (dto.notes !== undefined)
                billing.notes = dto.notes;
        }
        else {
            billing.status = 'UNPAID';
            billing.paidAt = null;
            billing.amountPaid = 0;
            billing.paymentMethod = null;
            if (dto.notes !== undefined)
                billing.notes = dto.notes;
        }
        return this.billingRepo.save(billing);
    }
    async getBusinessTypes() {
        const types = await this.businessTypeRepo.find({
            order: { displayOrder: 'ASC', createdAt: 'ASC' },
            relations: ['businesses'],
        });
        return types.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
            icon: t.icon,
            isActive: t.isActive,
            displayOrder: t.displayOrder,
            businessCount: t.businesses ? t.businesses.length : 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));
    }
    async createBusinessType(dto) {
        if (!dto.name)
            throw new common_1.BadRequestException('Business type name is required');
        const slug = dto.slug || dto.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const existing = await this.businessTypeRepo.findOne({
            where: [{ name: dto.name.trim() }, { slug }],
        });
        if (existing) {
            throw new common_1.BadRequestException('Business type with this name or slug already exists');
        }
        const businessType = this.businessTypeRepo.create({
            name: dto.name.trim(),
            slug,
            description: dto.description || null,
            icon: dto.icon || '🏪',
            displayOrder: Number(dto.displayOrder) || 0,
            isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
        });
        return this.businessTypeRepo.save(businessType);
    }
    async updateBusinessType(id, dto) {
        const businessType = await this.businessTypeRepo.findOne({ where: { id } });
        if (!businessType)
            throw new common_1.NotFoundException('Business type not found');
        if (dto.name)
            businessType.name = dto.name.trim();
        if (dto.slug)
            businessType.slug = dto.slug.trim();
        if (dto.description !== undefined)
            businessType.description = dto.description;
        if (dto.icon !== undefined)
            businessType.icon = dto.icon;
        if (dto.displayOrder !== undefined)
            businessType.displayOrder = Number(dto.displayOrder);
        if (dto.isActive !== undefined)
            businessType.isActive = Boolean(dto.isActive);
        return this.businessTypeRepo.save(businessType);
    }
    async toggleBusinessTypeStatus(id, isActive) {
        const businessType = await this.businessTypeRepo.findOne({ where: { id } });
        if (!businessType)
            throw new common_1.NotFoundException('Business type not found');
        businessType.isActive = Boolean(isActive);
        return this.businessTypeRepo.save(businessType);
    }
    async getCities() {
        return this.citiesService.getAllCities();
    }
    async createCity(dto) {
        return this.citiesService.createCity(dto);
    }
    async updateCity(id, dto) {
        return this.citiesService.updateCity(id, dto);
    }
    async toggleCityStatus(id, isActive) {
        return this.citiesService.toggleCityStatus(id, isActive);
    }
    async createSystemBackup() {
        return this.backupService.createDatabaseBackup();
    }
    cleanupBackupFile(filePath) {
        this.backupService.cleanupFile(filePath);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(3, (0, typeorm_1.InjectRepository)(business_membership_entity_1.BusinessMembership)),
    __param(4, (0, typeorm_1.InjectRepository)(business_billing_entity_1.BusinessBilling)),
    __param(5, (0, typeorm_1.InjectRepository)(business_type_entity_1.BusinessType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        backup_service_1.BackupService,
        cities_service_1.CitiesService])
], AdminService);
//# sourceMappingURL=admin.service.js.map