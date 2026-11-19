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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMessageStatusDto = exports.UpdateContactSettingsDto = exports.CreateContactMessageDto = void 0;
const class_validator_1 = require("class-validator");
class CreateContactMessageDto {
}
exports.CreateContactMessageDto = CreateContactMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Full name is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateContactMessageDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email address is required' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Email cannot exceed 150 characters' }),
    __metadata("design:type", String)
], CreateContactMessageDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Phone number cannot exceed 50 characters' }),
    __metadata("design:type", String)
], CreateContactMessageDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Subject is required' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Subject cannot exceed 200 characters' }),
    __metadata("design:type", String)
], CreateContactMessageDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Message cannot be empty' }),
    (0, class_validator_1.MaxLength)(3000, { message: 'Message cannot exceed 3000 characters' }),
    __metadata("design:type", String)
], CreateContactMessageDto.prototype, "message", void 0);
class UpdateContactSettingsDto {
}
exports.UpdateContactSettingsDto = UpdateContactSettingsDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'A valid contact email is required' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contact email is required' }),
    __metadata("design:type", String)
], UpdateContactSettingsDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", Object)
], UpdateContactSettingsDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", Object)
], UpdateContactSettingsDto.prototype, "whatsappNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", Object)
], UpdateContactSettingsDto.prototype, "businessHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UpdateContactSettingsDto.prototype, "description", void 0);
class UpdateMessageStatusDto {
}
exports.UpdateMessageStatusDto = UpdateMessageStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(['NEW', 'READ', 'RESOLVED'], { message: 'Status must be NEW, READ, or RESOLVED' }),
    __metadata("design:type", String)
], UpdateMessageStatusDto.prototype, "status", void 0);
//# sourceMappingURL=contact.dto.js.map