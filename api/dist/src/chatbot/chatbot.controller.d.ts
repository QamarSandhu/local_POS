import { Request } from 'express';
import { ChatbotService } from './chatbot.service';
import { ChatbotQueryDto, ChatbotResponseDto } from './dto/chatbot-query.dto';
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    query(dto: ChatbotQueryDto, req: Request): Promise<ChatbotResponseDto>;
    getStarters(): {
        id: string;
        question: string;
    }[];
}
