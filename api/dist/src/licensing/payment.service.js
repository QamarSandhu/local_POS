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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_record_entity_1 = require("../database/entities/payment-record.entity");
const business_entity_1 = require("../database/entities/business.entity");
let PaymentService = class PaymentService {
    constructor(paymentRepo, businessRepo) {
        this.paymentRepo = paymentRepo;
        this.businessRepo = businessRepo;
    }
    async createPayment(dto) {
        const business = await this.businessRepo.findOne({ where: { id: dto.businessId } });
        if (!business) {
            throw new common_1.NotFoundException(`Business with ID "${dto.businessId}" not found`);
        }
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero');
        }
        const record = this.paymentRepo.create({
            businessId: dto.businessId,
            licenseId: dto.licenseId || null,
            amount: dto.amount,
            paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
            referenceNumber: dto.referenceNumber || null,
            status: dto.status || 'PENDING',
            notes: dto.notes || null,
            paymentDate: new Date(),
        });
        return this.paymentRepo.save(record);
    }
    async updatePaymentStatus(id, status, adminId, notes) {
        const payment = await this.paymentRepo.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment record with ID "${id}" not found`);
        }
        payment.status = status;
        if (status === 'PAID') {
            payment.confirmedAt = new Date();
            payment.confirmedBy = adminId || null;
        }
        if (notes) {
            payment.notes = payment.notes ? `${payment.notes}\n${notes}` : notes;
        }
        return this.paymentRepo.save(payment);
    }
    async getPayments(query) {
        const qb = this.paymentRepo.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.business', 'business')
            .leftJoinAndSelect('payment.license', 'license')
            .orderBy('payment.paymentDate', 'DESC');
        if (query?.businessId) {
            qb.andWhere('payment.businessId = :bizId', { bizId: query.businessId });
        }
        if (query?.status) {
            qb.andWhere('payment.status = :status', { status: query.status });
        }
        return qb.getMany();
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_record_entity_1.PaymentRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentService);
//# sourceMappingURL=payment.service.js.map