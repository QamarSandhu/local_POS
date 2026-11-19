import { Repository } from 'typeorm';
import { City } from '../database/entities/city.entity';
import { Business } from '../database/entities/business.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
export declare class CitiesService {
    private cityRepository;
    private businessRepository;
    private readonly logger;
    constructor(cityRepository: Repository<City>, businessRepository: Repository<Business>);
    getActiveCities(): Promise<City[]>;
    getAllCities(): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        country: string;
        businessCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<City>;
    findBySlug(slug: string): Promise<City>;
    createCity(dto: CreateCityDto): Promise<City>;
    updateCity(id: string, dto: UpdateCityDto): Promise<City>;
    toggleCityStatus(id: string, isActive: boolean): Promise<City>;
    ensureDefaultCities(): Promise<void>;
}
