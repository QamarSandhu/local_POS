"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1788850637866 = void 0;
class InitialSchema1788850637866 {
    constructor() {
        this.name = 'InitialSchema1788850637866';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "business_settings" ("businessId" uuid NOT NULL, "deliveryEnabled" boolean NOT NULL DEFAULT true, "pickupEnabled" boolean NOT NULL DEFAULT true, "codEnabled" boolean NOT NULL DEFAULT true, "minimumOrder" numeric(10,2) NOT NULL DEFAULT '0', "minimumDeliveryOrder" numeric(10,2) NOT NULL DEFAULT '0', "deliveryCharges" numeric(10,2) NOT NULL DEFAULT '0', "freeDeliveryThreshold" numeric(10,2), "deliveryRadius" numeric(10,2) NOT NULL DEFAULT '5', "taxPercentage" numeric(5,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_0d63f34228aa37c0af0cb20bbc6" PRIMARY KEY ("businessId"))`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "name" character varying NOT NULL, "priceModifier" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_addons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_c909c66608157a4304cf090dcab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "categoryId" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "image" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "name" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "name" character varying NOT NULL, "email" character varying, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item_addons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderItemId" uuid NOT NULL, "addonId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, CONSTRAINT "PK_4330667b2b406c8e4fb6214b235" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "clientOrderId" character varying NOT NULL, "source" character varying NOT NULL, "status" character varying NOT NULL, "customerId" uuid, "salesmanId" character varying, "subtotal" numeric(10,2) NOT NULL, "tax" numeric(10,2) NOT NULL DEFAULT '0', "discount" numeric(10,2) NOT NULL DEFAULT '0', "deliveryFee" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "paymentMethod" character varying NOT NULL, "paymentStatus" character varying NOT NULL DEFAULT 'PENDING', "type" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_093fcf2f52870c08357e9795766" UNIQUE ("clientOrderId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "businesses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "logo" character varying, "coverImage" character varying, "phone" character varying, "address" character varying, "city" character varying, "description" text, "isActive" boolean NOT NULL DEFAULT true, "isFeatured" boolean NOT NULL DEFAULT false, "featuredUntil" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_82ca19bc20713fdfa72626a5da0" UNIQUE ("slug"), CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" character varying NOT NULL, "name" character varying NOT NULL, "permissions" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "business_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "businessId" uuid NOT NULL, "roleId" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_175d328b8efceccea96a421d8f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sync_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientOrderId" character varying NOT NULL, "businessId" character varying NOT NULL, "status" character varying NOT NULL, "error" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_892469fa0d5a3f514186ade7953" UNIQUE ("clientOrderId"), CONSTRAINT "PK_57204e18793ddafb1a18a4915fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "business_settings" ADD CONSTRAINT "FK_0d63f34228aa37c0af0cb20bbc6" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_addons" ADD CONSTRAINT "FK_a2a9df582b310423e7bf7c0304e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_359bd8406fbfb50e3ea42b5631f" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_a018fc1aa37f34fdde4f0a1982c" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_addons" ADD CONSTRAINT "FK_e41b6ae79c55ce4a4740fc79e22" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_addons" ADD CONSTRAINT "FK_95bf8e688cc4598f1736c7069e0" FOREIGN KEY ("addonId") REFERENCES "product_addons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_778777c5d7d56ed1bbaa907b8e5" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_memberships" ADD CONSTRAINT "FK_bab19cfd6919376d92708d956a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_memberships" ADD CONSTRAINT "FK_1542a1574a871ac37258a964f8d" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_memberships" ADD CONSTRAINT "FK_d9041abc132e51f0f1928175a57" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "business_memberships" DROP CONSTRAINT "FK_d9041abc132e51f0f1928175a57"`);
        await queryRunner.query(`ALTER TABLE "business_memberships" DROP CONSTRAINT "FK_1542a1574a871ac37258a964f8d"`);
        await queryRunner.query(`ALTER TABLE "business_memberships" DROP CONSTRAINT "FK_bab19cfd6919376d92708d956a6"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_778777c5d7d56ed1bbaa907b8e5"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "order_item_addons" DROP CONSTRAINT "FK_95bf8e688cc4598f1736c7069e0"`);
        await queryRunner.query(`ALTER TABLE "order_item_addons" DROP CONSTRAINT "FK_e41b6ae79c55ce4a4740fc79e22"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_a018fc1aa37f34fdde4f0a1982c"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_359bd8406fbfb50e3ea42b5631f"`);
        await queryRunner.query(`ALTER TABLE "product_addons" DROP CONSTRAINT "FK_a2a9df582b310423e7bf7c0304e"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "business_settings" DROP CONSTRAINT "FK_0d63f34228aa37c0af0cb20bbc6"`);
        await queryRunner.query(`DROP TABLE "sync_records"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "business_memberships"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "businesses"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "order_item_addons"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_addons"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TABLE "business_settings"`);
    }
}
exports.InitialSchema1788850637866 = InitialSchema1788850637866;
//# sourceMappingURL=1788850637866-InitialSchema.js.map