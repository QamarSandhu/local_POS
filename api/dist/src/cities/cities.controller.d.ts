import { CitiesService } from './cities.service';
export declare class CitiesController {
    private readonly citiesService;
    constructor(citiesService: CitiesService);
    getActiveCities(): Promise<import("../database/entities").City[]>;
    getCityById(id: string): Promise<import("../database/entities").City>;
}
