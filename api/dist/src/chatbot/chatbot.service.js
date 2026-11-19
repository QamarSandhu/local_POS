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
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const faq_knowledge_1 = require("./data/faq-knowledge");
const cities_service_1 = require("../cities/cities.service");
let ChatbotService = class ChatbotService {
    constructor(citiesService) {
        this.citiesService = citiesService;
        this.rateLimits = new Map();
        this.RATE_LIMIT_MAX = 35;
        this.RATE_LIMIT_WINDOW = 60 * 1000;
    }
    checkRateLimit(clientIp) {
        const now = Date.now();
        const record = this.rateLimits.get(clientIp);
        if (!record || now > record.resetTime) {
            this.rateLimits.set(clientIp, {
                count: 1,
                resetTime: now + this.RATE_LIMIT_WINDOW,
            });
            return;
        }
        record.count += 1;
        if (record.count > this.RATE_LIMIT_MAX) {
            throw new common_1.HttpException('Too many chat requests. Please wait a moment before asking another question.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    normalizeText(text) {
        let normalized = text.toLowerCase();
        normalized = normalized.replace(/[^\w\s]/g, ' ');
        normalized = normalized.replace(/\s+/g, ' ').trim();
        const transliterationMap = [
            [/\b(kesy|kese|kaisy|kaise|kis tarah)\b/g, 'how'],
            [/\b(krna|karna|kren|karein|karun|karon|karo)\b/g, 'do'],
            [/\b(bnao|banaen|banaun|banana|banayein|banega|banegi)\b/g, 'create'],
            [/\b(chahye|chahiye|zarurat)\b/g, 'need'],
            [/\b(kahan|kidhar)\b/g, 'where'],
            [/\b(mangwana|kharidna|mangwaun)\b/g, 'order'],
            [/\b(kitna|kitne|kitni)\b/g, 'cost'],
            [/\b(batao|bataen|batayein)\b/g, 'tell'],
            [/\b(dukan|dukaan)\b/g, 'store'],
            [/\b(parchi|parchee)\b/g, 'receipt'],
            [/\b(paise|rupay|rupees)\b/g, 'pricing'],
            [/\b(rabta|baat|call)\b/g, 'contact'],
            [/\b(band|khatam)\b/g, 'unavailable'],
        ];
        for (const [pattern, replacement] of transliterationMap) {
            normalized = normalized.replace(pattern, replacement);
        }
        return normalized;
    }
    scoreMatch(rawInput, normalizedInput, faq) {
        let score = 0;
        for (const pattern of faq.patterns) {
            if (pattern.test(rawInput) || pattern.test(normalizedInput)) {
                score = 0.85;
                break;
            }
        }
        const inputTokens = new Set(normalizedInput.split(' ').filter(Boolean));
        if (inputTokens.size === 0)
            return score;
        let matchedKeywords = 0;
        for (const keyword of faq.keywords) {
            const keywordLower = keyword.toLowerCase();
            if (keywordLower.includes(' ')) {
                if (normalizedInput.includes(keywordLower)) {
                    matchedKeywords += 2.0;
                }
            }
            else if (inputTokens.has(keywordLower)) {
                matchedKeywords += 1.0;
            }
        }
        if (score > 0) {
            return Math.min(score + Math.min(matchedKeywords * 0.04, 0.14), 0.99);
        }
        const keywordScore = Math.min(matchedKeywords / Math.max(faq.keywords.length * 0.25, 2.0), 0.84);
        return keywordScore;
    }
    async processQuery(rawMessage, clientIp = '127.0.0.1') {
        this.checkRateLimit(clientIp);
        const trimmed = (rawMessage || '').trim();
        if (!trimmed) {
            return {
                answer: faq_knowledge_1.FALLBACK_RESPONSE.answer,
                actionChips: faq_knowledge_1.FALLBACK_RESPONSE.actionChips,
                suggestedQuestions: faq_knowledge_1.FALLBACK_RESPONSE.suggestedQuestions,
                confidence: 0,
            };
        }
        const normalized = this.normalizeText(trimmed);
        let bestMatch = null;
        let highestScore = 0;
        for (const faq of faq_knowledge_1.FAQ_KNOWLEDGE_BASE) {
            const score = this.scoreMatch(trimmed, normalized, faq);
            if (score > highestScore) {
                highestScore = score;
                bestMatch = faq;
            }
        }
        if (bestMatch && highestScore >= 0.4) {
            let dynamicAnswer = bestMatch.answer;
            if (bestMatch.id === 'CITY_AVAILABILITY' && this.citiesService) {
                try {
                    const activeCities = await this.citiesService.getActiveCities();
                    if (activeCities && activeCities.length > 0) {
                        const cityNames = activeCities.map((c) => c.name).join(', ');
                        dynamicAnswer = `Let's Buy It is waqt in active cities mein operating kar raha hai: **${cityNames}**.\n\nAap marketplace par apna shehar select kar sakte hain ya **Anywhere** choose kar ke kisi bhi shehar ke restaurants aur stores browse kar sakte hain.`;
                    }
                }
                catch {
                }
            }
            return {
                answer: dynamicAnswer,
                actionChips: bestMatch.actionChips,
                matchedIntent: bestMatch.id,
                confidence: Math.round(highestScore * 100) / 100,
            };
        }
        return {
            answer: faq_knowledge_1.FALLBACK_RESPONSE.answer,
            actionChips: faq_knowledge_1.FALLBACK_RESPONSE.actionChips,
            suggestedQuestions: faq_knowledge_1.FALLBACK_RESPONSE.suggestedQuestions,
            confidence: Math.round(highestScore * 100) / 100,
        };
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [cities_service_1.CitiesService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map