"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLicensesAndPaymentRecords1789000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateLicensesAndPaymentRecords1789000000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'licenses',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'licenseNumber',
                    type: 'varchar',
                    length: '64',
                    isUnique: true,
                },
                {
                    name: 'licenseKey',
                    type: 'text',
                },
                {
                    name: 'businessId',
                    type: 'uuid',
                },
                {
                    name: 'businessName',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'plan',
                    type: 'varchar',
                    length: '50',
                    default: "'COMMERCIAL'",
                },
                {
                    name: 'issuedAt',
                    type: 'timestamp',
                },
                {
                    name: 'expiresAt',
                    type: 'timestamp',
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '32',
                    default: "'ACTIVE'",
                },
                {
                    name: 'lastVerifiedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'signature',
                    type: 'text',
                },
                {
                    name: 'installationId',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'notes',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('licenses', new typeorm_1.TableIndex({
            name: 'IDX_LICENSES_BUSINESS_ID',
            columnNames: ['businessId'],
        }));
        await queryRunner.createIndex('licenses', new typeorm_1.TableIndex({
            name: 'IDX_LICENSES_EXPIRES_AT',
            columnNames: ['expiresAt'],
        }));
        await queryRunner.createForeignKey('licenses', new typeorm_1.TableForeignKey({
            name: 'FK_LICENSES_BUSINESS',
            columnNames: ['businessId'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'payment_records',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'businessId',
                    type: 'uuid',
                },
                {
                    name: 'licenseId',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 12,
                    scale: 2,
                    default: '0',
                },
                {
                    name: 'paymentDate',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'paymentMethod',
                    type: 'varchar',
                    length: '50',
                    default: "'BANK_TRANSFER'",
                },
                {
                    name: 'referenceNumber',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '32',
                    default: "'PENDING'",
                },
                {
                    name: 'notes',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'confirmedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'confirmedBy',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('payment_records', new typeorm_1.TableIndex({
            name: 'IDX_PAYMENTS_BUSINESS_ID',
            columnNames: ['businessId'],
        }));
        await queryRunner.createIndex('payment_records', new typeorm_1.TableIndex({
            name: 'IDX_PAYMENTS_LICENSE_ID',
            columnNames: ['licenseId'],
        }));
        await queryRunner.createForeignKey('payment_records', new typeorm_1.TableForeignKey({
            name: 'FK_PAYMENTS_BUSINESS',
            columnNames: ['businessId'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('payment_records', new typeorm_1.TableForeignKey({
            name: 'FK_PAYMENTS_LICENSE',
            columnNames: ['licenseId'],
            referencedTableName: 'licenses',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('payment_records', true);
        await queryRunner.dropTable('licenses', true);
    }
}
exports.CreateLicensesAndPaymentRecords1789000000000 = CreateLicensesAndPaymentRecords1789000000000;
//# sourceMappingURL=1789000000000-CreateLicensesAndPaymentRecords.js.map