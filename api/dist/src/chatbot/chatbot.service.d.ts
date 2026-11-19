import { ChatbotResponseDto } from './dto/chatbot-query.dto';
import { CitiesService } from '../cities/cities.service';
export declare class ChatbotService {
    private citiesService?;
    private readonly rateLimits;
    private readonly RATE_LIMIT_MAX;
    private readonly RATE_LIMIT_WINDOW;
    constructor(citiesService?: CitiesService | undefined);
    checkRateLimit(clientIp: string): void;
    normalizeText(text: string): string;
    private scoreMatch;
    processQuery(rawMessage: string, clientIp?: string): Promise<ChatbotResponseDto>;
}
