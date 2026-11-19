import { ChatActionChip } from '../dto/chatbot-query.dto';
export interface FAQItem {
    id: string;
    category: 'GREETING' | 'ONBOARDING' | 'POS' | 'MENU' | 'ORDERS' | 'PRICING' | 'MARKETPLACE' | 'STAFF' | 'REPORTS' | 'SETTINGS' | 'SUPPORT' | 'GENERAL';
    keywords: string[];
    patterns: RegExp[];
    answer: string;
    actionChips: ChatActionChip[];
}
export declare const FAQ_KNOWLEDGE_BASE: FAQItem[];
export declare const FALLBACK_RESPONSE: {
    answer: string;
    actionChips: {
        label: string;
        href: string;
    }[];
    suggestedQuestions: string[];
};
