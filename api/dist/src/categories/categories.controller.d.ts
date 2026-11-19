import { CategoriesService } from './categories.service';
import { Category } from '../database/entities/category.entity';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<Category[]>;
    findOne(req: any, id: string): Promise<Category>;
    createBulk(req: any, body: {
        names: string[];
    }): Promise<Category[]>;
    create(req: any, body: Partial<Category>): Promise<Category>;
    update(req: any, id: string, body: Partial<Category>): Promise<Category>;
    remove(req: any, id: string): Promise<Category>;
}
