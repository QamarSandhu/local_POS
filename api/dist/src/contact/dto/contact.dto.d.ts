import { ContactMessageStatus } from '../../database/entities/contact-message.entity';
export declare class CreateContactMessageDto {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}
export declare class UpdateContactSettingsDto {
    contactEmail: string;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
    businessHours?: string | null;
    description?: string | null;
}
export declare class UpdateMessageStatusDto {
    status: ContactMessageStatus;
}
