"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProduction = seedProduction;
const data_source_1 = require("./data-source");
const role_entity_1 = require("./src/database/entities/role.entity");
const business_type_entity_1 = require("./src/database/entities/business-type.entity");
const city_entity_1 = require("./src/database/entities/city.entity");
async function seedProduction() {
    console.log('Connecting to database for production initial seed...');
    if (!data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.initialize();
    }
    const roleRepo = data_source_1.AppDataSource.getRepository(role_entity_1.Role);
    const businessTypeRepo = data_source_1.AppDataSource.getRepository(business_type_entity_1.BusinessType);
    const cityRepo = data_source_1.AppDataSource.getRepository(city_entity_1.City);
    const rolesData = [
        {
            id: 'SUPER_ADMIN',
            name: 'Super Admin',
            permissions: ['*'],
        },
        {
            id: 'PLATFORM_MANAGER',
            name: 'Platform Manager',
            permissions: [
                'PLATFORM_DASHBOARD_VIEW',
                'RESTAURANT_VIEW',
                'RESTAURANT_APPROVE',
                'RESTAURANT_SUSPEND',
                'ORDER_VIEW_ALL',
                'BILLING_VIEW_ALL',
                'BILLING_UPDATE',
                'BUSINESS_TYPE_VIEW',
                'CITY_VIEW',
            ],
        },
        {
            id: 'BUSINESS_OWNER',
            name: 'Business Owner',
            permissions: [
                'BUSINESS_VIEW',
                'BUSINESS_UPDATE',
                'STAFF_VIEW',
                'STAFF_CREATE',
                'STAFF_UPDATE',
                'STAFF_DELETE',
                'PRODUCT_VIEW',
                'PRODUCT_CREATE',
                'PRODUCT_UPDATE',
                'PRODUCT_DELETE',
                'CATEGORY_VIEW',
                'CATEGORY_CREATE',
                'CATEGORY_UPDATE',
                'CATEGORY_DELETE',
                'POS_ORDER_CREATE',
                'POS_ORDER_VIEW',
                'POS_ORDER_UPDATE',
                'POS_ORDER_CANCEL',
                'ONLINE_ORDER_VIEW',
                'ONLINE_ORDER_ACCEPT',
                'ONLINE_ORDER_REJECT',
                'ONLINE_ORDER_UPDATE_STATUS',
                'SALES_REPORT_VIEW',
                'SALESMAN_REPORT_VIEW',
                'REPORT_VIEW',
                'MENU_VIEW',
                'MENU_CREATE',
                'MENU_UPDATE',
                'MENU_DELETE',
                'POS_VIEW',
                'POS_CREATE',
            ],
        },
        {
            id: 'MANAGER',
            name: 'Manager',
            permissions: [
                'PRODUCT_VIEW',
                'PRODUCT_CREATE',
                'PRODUCT_UPDATE',
                'PRODUCT_DELETE',
                'CATEGORY_VIEW',
                'CATEGORY_CREATE',
                'CATEGORY_UPDATE',
                'CATEGORY_DELETE',
                'POS_ORDER_CREATE',
                'POS_ORDER_VIEW',
                'POS_ORDER_UPDATE',
                'POS_ORDER_CANCEL',
                'ONLINE_ORDER_VIEW',
                'ONLINE_ORDER_ACCEPT',
                'ONLINE_ORDER_REJECT',
                'ONLINE_ORDER_UPDATE_STATUS',
                'SALES_REPORT_VIEW',
                'SALESMAN_REPORT_VIEW',
                'REPORT_VIEW',
                'MENU_VIEW',
                'MENU_CREATE',
                'MENU_UPDATE',
                'MENU_DELETE',
                'POS_VIEW',
                'POS_CREATE',
            ],
        },
        {
            id: 'CASHIER',
            name: 'Cashier',
            permissions: [
                'POS_ORDER_CREATE',
                'POS_ORDER_VIEW',
                'POS_VIEW',
                'POS_CREATE',
                'ONLINE_ORDER_VIEW',
                'PRODUCT_VIEW',
                'CATEGORY_VIEW',
            ],
        },
        {
            id: 'SALESMAN',
            name: 'Salesman / Waiter',
            permissions: ['POS_VIEW', 'PRODUCT_VIEW', 'CATEGORY_VIEW'],
        },
    ];
    for (const r of rolesData) {
        const existing = await roleRepo.findOne({ where: { id: r.id } });
        if (!existing) {
            await roleRepo.save(roleRepo.create(r));
            console.log(`Created role: ${r.name} (${r.id})`);
        }
        else {
            existing.name = r.name;
            existing.permissions = r.permissions;
            await roleRepo.save(existing);
        }
    }
    const businessTypesData = [
        {
            name: 'Food & Dining',
            slug: 'food',
            description: 'Restaurants, cafes, food trucks, bakeries, and cloud kitchens',
            category: 'food',
            icon: '🍽️',
            order: 1,
            isActive: true,
        },
        {
            name: 'Clothing & Apparel',
            slug: 'clothing',
            description: 'Fashion boutiques, fabric shops, footwear, and apparel stores',
            category: 'clothing',
            icon: '👗',
            order: 2,
            isActive: true,
        },
        {
            name: 'Electronics & Gadgets',
            slug: 'electronics',
            description: 'Consumer electronics, accessories, computer hardware, and mobile phones',
            category: 'retail',
            icon: '💻',
            order: 3,
            isActive: true,
        },
        {
            name: 'General Retail',
            slug: 'retail',
            description: 'Retail stores, supermarkets, department stores, and gift shops',
            category: 'retail',
            icon: '🛍️',
            order: 4,
            isActive: true,
        },
        {
            name: 'Pharmacy & Healthcare',
            slug: 'pharmacy',
            description: 'Pharmacies, medical stores, wellness shops, and health supplies',
            category: 'retail',
            icon: '💊',
            order: 5,
            isActive: true,
        },
    ];
    for (const bt of businessTypesData) {
        const existing = await businessTypeRepo.findOne({ where: { slug: bt.slug } });
        if (!existing) {
            await businessTypeRepo.save(businessTypeRepo.create(bt));
            console.log(`Created business vertical: ${bt.name}`);
        }
    }
    const defaultCities = [
        { name: 'Lahore', slug: 'lahore', province: 'Punjab', displayOrder: 1, isActive: true },
        { name: 'Karachi', slug: 'karachi', province: 'Sindh', displayOrder: 2, isActive: true },
        { name: 'Islamabad', slug: 'islamabad', province: 'Federal Capital', displayOrder: 3, isActive: true },
        { name: 'Rawalpindi', slug: 'rawalpindi', province: 'Punjab', displayOrder: 4, isActive: true },
        { name: 'Faisalabad', slug: 'faisalabad', province: 'Punjab', displayOrder: 5, isActive: true },
        { name: 'Multan', slug: 'multan', province: 'Punjab', displayOrder: 6, isActive: true },
        { name: 'Peshawar', slug: 'peshawar', province: 'Khyber Pakhtunkhwa', displayOrder: 7, isActive: true },
        { name: 'Quetta', slug: 'quetta', province: 'Balochistan', displayOrder: 8, isActive: true },
    ];
    for (const c of defaultCities) {
        const existing = await cityRepo.findOne({ where: { slug: c.slug } });
        if (!existing) {
            await cityRepo.save(cityRepo.create(c));
            console.log(`Created default city: ${c.name}`);
        }
    }
    console.log('Production initial seed completed successfully.');
    await data_source_1.AppDataSource.destroy();
}
if (require.main === module) {
    seedProduction()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-production.js.map