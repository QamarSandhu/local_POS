import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';
export declare class CategoriesService {
    private categoriesRepository;
    constructor(categoriesRepository: Repository<Category>);
    findAll(businessId: string): Promise<Category[]>;
    findOne(businessId: string, id: string): Promise<Category>;
    create(businessId: string, data: Partial<Category>): Promise<Category>;
    createBulk(businessId: string, names: string[]): Promise<Category[]>;
    update(businessId: string, id: string, data: Partial<Category>): Promise<Category>;
    remove(businessId: string, id: string): Promise<Category>;
}
