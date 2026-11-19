import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { BusinessMembership } from '../database/entities/business-membership.entity';
export declare class UsersService {
    private usersRepository;
    private membershipsRepository;
    constructor(usersRepository: Repository<User>, membershipsRepository: Repository<BusinessMembership>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(user: Partial<User>): Promise<User>;
    countSuperAdmins(): Promise<number>;
    save(user: User): Promise<User>;
}
