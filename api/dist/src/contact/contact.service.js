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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_settings_entity_1 = require("../database/entities/contact-settings.entity");
const contact_message_entity_1 = require("../database/entities/contact-message.entity");
let ContactService = ContactService_1 = class ContactService {
    constructor(settingsRepo, messageRepo) {
        this.settingsRepo = settingsRepo;
        this.messageRepo = messageRepo;
        this.logger = new common_1.Logger(ContactService_1.name);
    }
    async getSettings() {
        let settings = await this.settingsRepo.findOne({ where: { id: 'default' } });
        if (!settings) {
            settings = this.settingsRepo.create({
                id: 'default',
                contactEmail: 'support@letsbuyit.com',
                phoneNumber: null,
                whatsappNumber: null,
                businessHours: 'Monday – Friday, 9:00 AM – 6:00 PM',
                description: 'Have questions about our platform, pricing, or getting started? Get in touch with our team.',
            });
            await this.settingsRepo.save(settings);
        }
        return settings;
    }
    async getPublicSettings() {
        const settings = await this.getSettings();
        return {
            contactEmail: settings.contactEmail?.trim() || 'support@letsbuyit.com',
            phoneNumber: settings.phoneNumber?.trim() || null,
            whatsappNumber: settings.whatsappNumber?.trim() || null,
            businessHours: settings.businessHours?.trim() || null,
            description: settings.description?.trim() || null,
            updatedAt: settings.updatedAt,
        };
    }
    async updateSettings(dto) {
        const settings = await this.getSettings();
        settings.contactEmail = dto.contactEmail.trim();
        settings.phoneNumber = dto.phoneNumber?.trim() ? dto.phoneNumber.trim() : null;
        settings.whatsappNumber = dto.whatsappNumber?.trim() ? dto.whatsappNumber.trim() : null;
        settings.businessHours = dto.businessHours?.trim() ? dto.businessHours.trim() : null;
        settings.description = dto.description?.trim() ? dto.description.trim() : null;
        return this.settingsRepo.save(settings);
    }
    async createMessage(dto) {
        const message = this.messageRepo.create({
            name: dto.name.trim(),
            email: dto.email.trim().toLowerCase(),
            phone: dto.phone?.trim() ? dto.phone.trim() : null,
            subject: dto.subject.trim(),
            message: dto.message.trim(),
            status: 'NEW',
        });
        const saved = await this.messageRepo.save(message);
        const settings = await this.getSettings();
        this.sendNotificationEmail(settings.contactEmail, saved);
        return saved;
    }
    sendNotificationEmail(targetEmail, message) {
        this.logger.log(`[ContactNotification] New contact form inquiry received:\n` +
            `  • To: ${targetEmail}\n` +
            `  • From: ${message.name} <${message.email}>\n` +
            `  • Phone: ${message.phone || 'N/A'}\n` +
            `  • Subject: ${message.subject}\n` +
            `  • Message preview: ${message.message.substring(0, 100)}...`);
    }
    async getMessages(status) {
        const query = this.messageRepo.createQueryBuilder('m')
            .orderBy('m.createdAt', 'DESC');
        if (status) {
            query.andWhere('m.status = :status', { status });
        }
        return query.getMany();
    }
    async updateMessageStatus(id, status) {
        const message = await this.messageRepo.findOne({ where: { id } });
        if (!message) {
            throw new common_1.NotFoundException(`Contact message with ID ${id} not found`);
        }
        message.status = status;
        return this.messageRepo.save(message);
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_settings_entity_1.ContactSettings)),
    __param(1, (0, typeorm_1.InjectRepository)(contact_message_entity_1.ContactMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContactService);
//# sourceMappingURL=contact.service.js.map