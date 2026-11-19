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
exports.MembershipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const business_membership_entity_1 = require("../database/entities/business-membership.entity");
const users_service_1 = require("../users/users.service");
let MembershipsService = class MembershipsService {
    constructor(membershipsRepository, usersService) {
        this.membershipsRepository = membershipsRepository;
        this.usersService = usersService;
    }
    async getStaff(businessId) {
        return this.membershipsRepository.find({
            where: { businessId },
            relations: ['user', 'role'],
        });
    }
    async getSalesmen(businessId) {
        const memberships = await this.membershipsRepository.find({
            where: { businessId },
            relations: ['user', 'role'],
        });
        return memberships
            .filter(m => m.user && (m.roleId === 'SALESMAN' || m.roleId === 'CASHIER' || m.roleId === 'MANAGER'))
            .map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            roleId: m.roleId,
            roleName: m.role?.name || m.roleId,
        }));
    }
    async createStaff(businessId, data) {
        let user = await this.usersService.findByEmail(data.email);
        if (!user) {
            if (!data.password || data.password.trim().length < 6) {
                throw new common_1.BadRequestException('A secure initial password (minimum 6 characters) is required to create a staff account.');
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(data.password.trim(), salt);
            user = await this.usersService.create({
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                passwordHash,
            });
        }
        const existing = await this.membershipsRepository.findOne({
            where: { businessId, userId: user.id },
        });
        if (existing) {
            existing.roleId = data.roleId;
            return this.membershipsRepository.save(existing);
        }
        const membership = this.membershipsRepository.create({
            businessId,
            userId: user.id,
            roleId: data.roleId,
            status: 'ACTIVE',
        });
        return this.membershipsRepository.save(membership);
    }
    async inviteStaff(businessId, email, roleId) {
        return this.createStaff(businessId, { name: email.split('@')[0], email, roleId });
    }
    async updateStaffRole(businessId, membershipId, roleId) {
        const membership = await this.membershipsRepository.findOne({
            where: { id: membershipId, businessId },
        });
        if (!membership)
            throw new common_1.NotFoundException('Membership not found');
        membership.roleId = roleId;
        return this.membershipsRepository.save(membership);
    }
    async updateStaff(businessId, membershipId, data) {
        const membership = await this.membershipsRepository.findOne({
            where: { id: membershipId, businessId },
            relations: ['user'],
        });
        if (!membership)
            throw new common_1.NotFoundException('Staff member not found');
        if (data.roleId) {
            membership.roleId = data.roleId;
            await this.membershipsRepository.save(membership);
        }
        if (membership.user) {
            if (data.name && data.name.trim()) {
                membership.user.name = data.name.trim();
            }
            if (data.phone !== undefined) {
                membership.user.phone = data.phone?.trim() || '';
            }
            if (data.password && data.password.trim().length >= 6) {
                const salt = await bcrypt.genSalt(10);
                membership.user.passwordHash = await bcrypt.hash(data.password.trim(), salt);
            }
            await this.usersService.save(membership.user);
        }
        return this.membershipsRepository.findOne({
            where: { id: membershipId, businessId },
            relations: ['user', 'role'],
        });
    }
    async removeStaff(businessId, membershipId) {
        const membership = await this.membershipsRepository.findOne({
            where: { id: membershipId, businessId },
        });
        if (!membership)
            throw new common_1.NotFoundException('Membership not found');
        return this.membershipsRepository.remove(membership);
    }
};
exports.MembershipsService = MembershipsService;
exports.MembershipsService = MembershipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_membership_entity_1.BusinessMembership)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], MembershipsService);
//# sourceMappingURL=memberships.service.js.map