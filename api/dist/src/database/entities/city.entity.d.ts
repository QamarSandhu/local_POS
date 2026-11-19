import { Business } from './business.entity';
export declare class City {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    latitude: number | null;
    longitude: number | null;
    country: string;
    state: string | null;
    businesses: Business[];
    createdAt: Date;
    updatedAt: Date;
}
