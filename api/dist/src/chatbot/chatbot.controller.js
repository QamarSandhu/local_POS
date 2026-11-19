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
exports.ChatbotController = void 0;
const common_1 = require("@nestjs/common");
const chatbot_service_1 = require("./chatbot.service");
const chatbot_query_dto_1 = require("./dto/chatbot-query.dto");
let ChatbotController = class ChatbotController {
    constructor(chatbotService) {
        this.chatbotService = chatbotService;
    }
    async query(dto, req) {
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = (typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : req.socket?.remoteAddress || '127.0.0.1');
        return this.chatbotService.processQuery(dto.message, clientIp);
    }
    getStarters() {
        return [
            { id: '1', question: 'How do I register my business?' },
            { id: '2', question: 'What are the POS pricing plans?' },
            { id: '3', question: 'How do I use the POS counter?' },
            { id: '4', question: 'How can customers place an order?' },
            { id: '5', question: 'How do I contact customer support?' },
        ];
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Post)('query'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatbot_query_dto_1.ChatbotQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "query", null);
__decorate([
    (0, common_1.Get)('starters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatbotController.prototype, "getStarters", null);
exports.ChatbotController = ChatbotController = __decorate([
    (0, common_1.Controller)('chatbot'),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map