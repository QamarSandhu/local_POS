import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from './database/entities/role.entity';
import { BusinessType } from './database/entities/business-type.entity';
import { Business } from './database/entities/business.entity';
import { CitiesService } from './cities/cities.service';
export declare class AppService implements OnApplicationBootstrap {
    private readonly roleRepo;
    private readonly businessTypeRepo;
    private readonly businessRepo;
    private readonly citiesService;
    private readonly logger;
    constructor(roleRepo: Repository<Role>, businessTypeRepo: Repository<BusinessType>, businessRepo: Repository<Business>, citiesService: CitiesService);
    onApplicationBootstrap(): Promise<void>;
    private ensureSystemRoles;
    private ensureDefaultBusinessTypes;
    getHello(): string;
}
