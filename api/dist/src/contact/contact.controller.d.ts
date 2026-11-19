import { ContactService } from './contact.service';
import { CreateContactMessageDto, UpdateContactSettingsDto, UpdateMessageStatusDto } from './dto/contact.dto';
import { ContactMessageStatus } from '../database/entities/contact-message.entity';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    getPublicSettings(): Promise<{
        contactEmail: string;
        phoneNumber: string | null;
        whatsappNumber: string | null;
        businessHours: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    createMessage(dto: CreateContactMessageDto): Promise<import("../database/entities/contact-message.entity").ContactMessage>;
}
export declare class AdminContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    private checkSuperAdmin;
    getSettings(req: any): Promise<import("../database/entities").ContactSettings>;
    updateSettings(req: any, dto: UpdateContactSettingsDto): Promise<import("../database/entities").ContactSettings>;
    getMessages(req: any, status?: ContactMessageStatus): Promise<import("../database/entities/contact-message.entity").ContactMessage[]>;
    updateMessageStatus(req: any, id: string, body: UpdateMessageStatusDto): Promise<import("../database/entities/contact-message.entity").ContactMessage>;
}
