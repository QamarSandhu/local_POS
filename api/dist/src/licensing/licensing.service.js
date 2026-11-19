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
var LicensingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicensingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const license_entity_1 = require("../database/entities/license.entity");
const business_entity_1 = require("../database/entities/business.entity");
const license_crypto_util_1 = require("./license-crypto.util");
const FALLBACK_PUBLIC_KEY = 'MCowBQYDK2VwAyEAPjb2nTgSU0g8/mouPBSpxNpyCBy1u1sw2hnM90KebnM=';
const FALLBACK_PRIVATE_KEY = 'MC4CAQAwBQYDK2VwBCIEIAjzrT6ge+BHM0AO4cUerMG9lfx9Iuwy3TcFeuf+Zkyo';
let LicensingService = LicensingService_1 = class LicensingService {
    constructor(licenseRepo, businessRepo, configService) {
        this.licenseRepo = licenseRepo;
        this.businessRepo = businessRepo;
        this.configService = configService;
        this.logger = new common_1.Logger(LicensingService_1.name);
        this.lastVerificationWrite = 0;
    }
    getDeploymentMode() {
        return this.configService.get('DEPLOYMENT_MODE', 'hosted');
    }
    isSelfHosted() {
        return this.getDeploymentMode() === 'self-hosted';
    }
    getPublicKey() {
        return this.configService.get('LICENSE_PUBLIC_KEY') || FALLBACK_PUBLIC_KEY;
    }
    getPrivateKey() {
        return this.configService.get('LICENSE_PRIVATE_KEY') || FALLBACK_PRIVATE_KEY;
    }
    async generateLicense(dto) {
        const business = await this.businessRepo.findOne({ where: { id: dto.businessId } });
        if (!business) {
            throw new common_1.NotFoundException(`Business with ID "${dto.businessId}" not found`);
        }
        const issuedAt = new Date();
        let expiresAt;
        if (dto.expiresAt) {
            expiresAt = new Date(dto.expiresAt);
            if (isNaN(expiresAt.getTime()) || expiresAt <= issuedAt) {
                throw new common_1.BadRequestException('Expiry date must be a valid future timestamp');
            }
        }
        else {
            const months = dto.durationMonths || 3;
            expiresAt = new Date(issuedAt.getTime() + months * 30 * 24 * 60 * 60 * 1000);
        }
        const licenseNumber = `LIC-${Math.floor(10000 + Math.random() * 90000)}`;
        const payload = {
            licenseNumber,
            businessId: business.id,
            businessName: business.name,
            plan: business.pricingPlan || 'COMMERCIAL',
            issuedAt: issuedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            version: '1.0',
            installationId: dto.installationId,
        };
        const privateKey = this.getPrivateKey();
        const licenseKey = (0, license_crypto_util_1.signLicensePayload)(payload, privateKey);
        const signature = licenseKey.split('.')[2];
        const license = this.licenseRepo.create({
            licenseNumber,
            licenseKey,
            businessId: business.id,
            businessName: business.name,
            plan: business.pricingPlan || 'COMMERCIAL',
            issuedAt,
            expiresAt,
            isActive: true,
            status: 'ACTIVE',
            signature,
            installationId: dto.installationId || null,
            notes: dto.notes || null,
            lastVerifiedAt: issuedAt,
        });
        return this.licenseRepo.save(license);
    }
    async getLicenses(query) {
        const qb = this.licenseRepo.createQueryBuilder('license')
            .leftJoinAndSelect('license.business', 'business')
            .orderBy('license.createdAt', 'DESC');
        if (query?.businessId) {
            qb.andWhere('license.businessId = :bizId', { bizId: query.businessId });
        }
        if (query?.status) {
            qb.andWhere('license.status = :status', { status: query.status });
        }
        return qb.getMany();
    }
    async renewLicense(licenseId, dto) {
        const existing = await this.licenseRepo.findOne({ where: { id: licenseId } });
        if (!existing) {
            throw new common_1.NotFoundException(`License with ID "${licenseId}" not found`);
        }
        const now = new Date();
        const baseDate = existing.expiresAt > now ? existing.expiresAt : now;
        let expiresAt;
        if (dto.expiresAt) {
            expiresAt = new Date(dto.expiresAt);
        }
        else {
            const months = dto.durationMonths || 3;
            expiresAt = new Date(baseDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
        }
        existing.isActive = false;
        existing.status = 'RENEWED';
        await this.licenseRepo.save(existing);
        return this.generateLicense({
            businessId: existing.businessId,
            expiresAt: expiresAt.toISOString(),
            notes: dto.notes || `Renewal of ${existing.licenseNumber}`,
        });
    }
    async getActiveLicenseStatus(businessId) {
        if (!this.isSelfHosted()) {
            return {
                isLicensed: true,
                status: 'HOSTED',
                isWarning: false,
                warningLevel: 'NONE',
                message: 'Running in hosted cloud environment. Self-hosted license enforcement not required.',
            };
        }
        let license = null;
        if (businessId) {
            license = await this.licenseRepo.findOne({
                where: { businessId, isActive: true },
                order: { createdAt: 'DESC' },
            });
        }
        if (!license) {
            license = await this.licenseRepo.findOne({
                where: { isActive: true },
                order: { createdAt: 'DESC' },
            });
        }
        if (!license) {
            return {
                isLicensed: false,
                status: 'NOT_ACTIVATED',
                isWarning: false,
                warningLevel: 'NOT_ACTIVATED',
                message: 'No license key activated. Please configure your license in Business Settings.',
            };
        }
        const now = new Date();
        if (license.lastVerifiedAt) {
            const lastVerified = new Date(license.lastVerifiedAt).getTime();
            if (now.getTime() < lastVerified - 5 * 60 * 1000) {
                this.logger.warn(`Clock rollback detected for license ${license.licenseNumber}. Current: ${now}, Last: ${license.lastVerifiedAt}`);
                return {
                    isLicensed: false,
                    status: 'CLOCK_TAMPERED',
                    licenseNumber: license.licenseNumber,
                    businessId: license.businessId,
                    businessName: license.businessName,
                    expiresAt: license.expiresAt.toISOString(),
                    isWarning: true,
                    warningLevel: 'CLOCK_TAMPERED',
                    message: 'System clock tampering detected. The system date has been changed backward.',
                };
            }
        }
        const expiresAt = new Date(license.expiresAt);
        const msRemaining = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) {
            return {
                isLicensed: false,
                status: 'EXPIRED',
                licenseNumber: license.licenseNumber,
                businessId: license.businessId,
                businessName: license.businessName,
                issuedAt: license.issuedAt.toISOString(),
                expiresAt: license.expiresAt.toISOString(),
                daysRemaining: 0,
                isWarning: true,
                warningLevel: 'EXPIRED',
                message: 'Your license has expired. Please contact the administrator to renew your license.',
            };
        }
        let warningLevel = 'NONE';
        let isWarning = false;
        let message = undefined;
        if (daysRemaining === 1) {
            warningLevel = '1_DAY';
            isWarning = true;
            message = 'URGENT: Your license expires tomorrow! Contact admin to renew and avoid POS interruption.';
        }
        else if (daysRemaining === 2) {
            warningLevel = '2_DAYS';
            isWarning = true;
            message = 'Warning: Your license will expire in 2 days. Please contact admin to renew.';
        }
        else if (daysRemaining === 3) {
            warningLevel = '3_DAYS';
            isWarning = true;
            message = 'Notice: Your license will expire in 3 days. Please renew your subscription.';
        }
        return {
            isLicensed: true,
            status: 'ACTIVE',
            licenseNumber: license.licenseNumber,
            businessId: license.businessId,
            businessName: license.businessName,
            issuedAt: license.issuedAt.toISOString(),
            expiresAt: license.expiresAt.toISOString(),
            daysRemaining,
            isWarning,
            warningLevel,
            message,
        };
    }
    async activateLicense(licenseKey, businessId) {
        const publicKey = this.getPublicKey();
        const verification = (0, license_crypto_util_1.verifyLicenseKey)(licenseKey, publicKey);
        if (!verification.valid || !verification.payload) {
            throw new common_1.BadRequestException(verification.error || 'Invalid or malformed license key');
        }
        const payload = verification.payload;
        const now = new Date();
        const expiresAt = new Date(payload.expiresAt);
        if (expiresAt <= now) {
            throw new common_1.BadRequestException('This license key has already expired');
        }
        if (businessId && payload.businessId !== businessId) {
            throw new common_1.BadRequestException(`License key was issued for business "${payload.businessName}" (${payload.businessId}), but current business is ${businessId}`);
        }
        const targetBusinessId = businessId || payload.businessId;
        const latestExisting = await this.licenseRepo.findOne({
            where: { businessId: targetBusinessId },
            order: { lastVerifiedAt: 'DESC' },
        });
        if (latestExisting?.lastVerifiedAt) {
            const lastTime = new Date(latestExisting.lastVerifiedAt).getTime();
            if (now.getTime() < lastTime - 5 * 60 * 1000) {
                throw new common_1.BadRequestException('Clock tampering detected. Please ensure your system clock is accurate.');
            }
        }
        await this.licenseRepo.update({ businessId: targetBusinessId, isActive: true }, { isActive: false, status: 'REPLACED' });
        const signature = licenseKey.split('.')[2];
        let record = await this.licenseRepo.findOne({
            where: { licenseNumber: payload.licenseNumber },
        });
        if (record) {
            record.licenseKey = licenseKey;
            record.businessId = targetBusinessId;
            record.businessName = payload.businessName;
            record.plan = payload.plan || 'COMMERCIAL';
            record.issuedAt = new Date(payload.issuedAt);
            record.expiresAt = expiresAt;
            record.isActive = true;
            record.status = 'ACTIVE';
            record.signature = signature;
            record.installationId = payload.installationId || null;
            record.lastVerifiedAt = now;
        }
        else {
            record = this.licenseRepo.create({
                licenseNumber: payload.licenseNumber,
                licenseKey,
                businessId: targetBusinessId,
                businessName: payload.businessName,
                plan: payload.plan || 'COMMERCIAL',
                issuedAt: new Date(payload.issuedAt),
                expiresAt,
                isActive: true,
                status: 'ACTIVE',
                signature,
                installationId: payload.installationId || null,
                lastVerifiedAt: now,
            });
        }
        await this.licenseRepo.save(record);
        return this.getActiveLicenseStatus(targetBusinessId);
    }
    async validateRequestLicense(businessId) {
        if (!this.isSelfHosted()) {
            return true;
        }
        const status = await this.getActiveLicenseStatus(businessId);
        if (!status.isLicensed) {
            throw new common_1.ForbiddenException({
                success: false,
                code: status.status === 'CLOCK_TAMPERED' ? 'CLOCK_TAMPER_DETECTED' : 'LICENSE_EXPIRED',
                message: status.message || 'Your license has expired. Please contact the administrator to renew your license.',
            });
        }
        const now = Date.now();
        if (now - this.lastVerificationWrite > 10 * 60 * 1000) {
            this.lastVerificationWrite = now;
            this.licenseRepo.update({ businessId, isActive: true }, { lastVerifiedAt: new Date() }).catch(() => null);
        }
        return true;
    }
};
exports.LicensingService = LicensingService;
exports.LicensingService = LicensingService = LicensingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_entity_1.License)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], LicensingService);
//# sourceMappingURL=licensing.service.js.map