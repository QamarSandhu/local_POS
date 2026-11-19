"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCityAndBusinessCities1788900000000 = void 0;
class CreateCityAndBusinessCities1788900000000 {
    constructor() {
        this.name = 'CreateCityAndBusinessCities1788900000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "latitude" numeric(10,6),
                "longitude" numeric(10,6),
                "country" character varying NOT NULL DEFAULT 'Pakistan',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_cities_name" UNIQUE ("name"),
                CONSTRAINT "UQ_cities_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_cities_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "business_cities" (
                "businessId" uuid NOT NULL,
                "cityId" uuid NOT NULL,
                CONSTRAINT "PK_business_cities" PRIMARY KEY ("businessId", "cityId")
            )
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_business_cities_business') THEN
                    ALTER TABLE "business_cities" ADD CONSTRAINT "FK_business_cities_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_business_cities_city') THEN
                    ALTER TABLE "business_cities" ADD CONSTRAINT "FK_business_cities_city" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_business_cities_cityId" ON "business_cities" ("cityId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_business_cities_businessId" ON "business_cities" ("businessId")`);
        await queryRunner.query(`
            INSERT INTO "cities" ("name", "slug", "isActive", "latitude", "longitude", "country")
            VALUES ('Mandi Bahauddin', 'mandi-bahauddin', true, 32.587000, 73.491200, 'Pakistan')
            ON CONFLICT ("slug") DO UPDATE SET "isActive" = true, "name" = 'Mandi Bahauddin';
        `);
        await queryRunner.query(`
            INSERT INTO "cities" ("name", "slug", "isActive", "latitude", "longitude", "country")
            VALUES 
                ('Lahore', 'lahore', false, 31.520400, 74.358700, 'Pakistan'),
                ('Islamabad', 'islamabad', false, 33.684400, 73.047900, 'Pakistan'),
                ('Karachi', 'karachi', false, 24.860700, 67.001100, 'Pakistan')
            ON CONFLICT ("slug") DO NOTHING;
        `);
        await queryRunner.query(`
            DO $$
            DECLARE
                mandi_id uuid;
                lahore_id uuid;
            BEGIN
                SELECT id INTO mandi_id FROM "cities" WHERE slug = 'mandi-bahauddin' LIMIT 1;
                SELECT id INTO lahore_id FROM "cities" WHERE slug = 'lahore' LIMIT 1;

                IF mandi_id IS NOT NULL THEN
                    -- Associate any business without city or whose city contains mandi
                    INSERT INTO "business_cities" ("businessId", "cityId")
                    SELECT b.id, mandi_id
                    FROM "businesses" b
                    WHERE (b.city IS NULL OR LOWER(b.city) LIKE '%mandi%' OR b.id NOT IN (SELECT "businessId" FROM "business_cities"))
                    ON CONFLICT DO NOTHING;
                END IF;

                IF lahore_id IS NOT NULL THEN
                    INSERT INTO "business_cities" ("businessId", "cityId")
                    SELECT b.id, lahore_id
                    FROM "businesses" b
                    WHERE LOWER(b.city) LIKE '%lahore%'
                    ON CONFLICT DO NOTHING;
                END IF;
            END $$;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_business_cities_businessId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_business_cities_cityId"`);
        await queryRunner.query(`ALTER TABLE "business_cities" DROP CONSTRAINT IF EXISTS "FK_business_cities_city"`);
        await queryRunner.query(`ALTER TABLE "business_cities" DROP CONSTRAINT IF EXISTS "FK_business_cities_business"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "business_cities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cities"`);
    }
}
exports.CreateCityAndBusinessCities1788900000000 = CreateCityAndBusinessCities1788900000000;
//# sourceMappingURL=1788900000000-CreateCityAndBusinessCities.js.map