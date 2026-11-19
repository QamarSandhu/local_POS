export declare class ChatbotQueryDto {
    message: string;
}
export interface ChatActionChip {
    label: string;
    href: string;
}
export interface ChatbotResponseDto {
    answer: string;
    actionChips: ChatActionChip[];
    suggestedQuestions?: string[];
    matchedIntent?: string;
    confidence: number;
}
