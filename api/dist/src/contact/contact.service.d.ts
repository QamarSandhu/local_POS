import { Repository } from 'typeorm';
import { ContactSettings } from '../database/entities/contact-settings.entity';
import { ContactMessage, ContactMessageStatus } from '../database/entities/contact-message.entity';
import { CreateContactMessageDto, UpdateContactSettingsDto } from './dto/contact.dto';
export declare class ContactService {
    private settingsRepo;
    private messageRepo;
    private readonly logger;
    constructor(settingsRepo: Repository<ContactSettings>, messageRepo: Repository<ContactMessage>);
    getSettings(): Promise<ContactSettings>;
    getPublicSettings(): Promise<{
        contactEmail: string;
        phoneNumber: string | null;
        whatsappNumber: string | null;
        businessHours: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    updateSettings(dto: UpdateContactSettingsDto): Promise<ContactSettings>;
    createMessage(dto: CreateContactMessageDto): Promise<ContactMessage>;
    private sendNotificationEmail;
    getMessages(status?: ContactMessageStatus): Promise<ContactMessage[]>;
    updateMessageStatus(id: string, status: ContactMessageStatus): Promise<ContactMessage>;
}
