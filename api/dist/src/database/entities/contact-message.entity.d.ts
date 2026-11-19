export type ContactMessageStatus = 'NEW' | 'READ' | 'RESOLVED';
export declare class ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: ContactMessageStatus;
    createdAt: Date;
    updatedAt: Date;
}
