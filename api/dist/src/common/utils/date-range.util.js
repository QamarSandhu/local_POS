"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndValidateDateRange = parseAndValidateDateRange;
const common_1 = require("@nestjs/common");
function parseAndValidateDateRange(fromDate, toDate) {
    if (!fromDate && !toDate) {
        return { isFiltered: false };
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let parsedStart;
    if (fromDate) {
        if (dateRegex.test(fromDate)) {
            const [y, m, d] = fromDate.split('-').map(Number);
            parsedStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
            if (isNaN(parsedStart.getTime()) ||
                parsedStart.getUTCFullYear() !== y ||
                parsedStart.getUTCMonth() !== m - 1 ||
                parsedStart.getUTCDate() !== d) {
                throw new common_1.BadRequestException(`Invalid fromDate: "${fromDate}" is not a valid calendar date.`);
            }
        }
        else {
            parsedStart = new Date(fromDate);
            if (isNaN(parsedStart.getTime())) {
                throw new common_1.BadRequestException(`Invalid fromDate: "${fromDate}" could not be parsed.`);
            }
        }
    }
    let parsedEndExclusive;
    if (toDate) {
        if (dateRegex.test(toDate)) {
            const [y, m, d] = toDate.split('-').map(Number);
            const testDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
            if (isNaN(testDate.getTime()) ||
                testDate.getUTCFullYear() !== y ||
                testDate.getUTCMonth() !== m - 1 ||
                testDate.getUTCDate() !== d) {
                throw new common_1.BadRequestException(`Invalid toDate: "${toDate}" is not a valid calendar date.`);
            }
            parsedEndExclusive = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
        }
        else {
            const parsedEnd = new Date(toDate);
            if (isNaN(parsedEnd.getTime())) {
                throw new common_1.BadRequestException(`Invalid toDate: "${toDate}" could not be parsed.`);
            }
            parsedEndExclusive = new Date(parsedEnd.getTime() + 1);
        }
    }
    if (parsedStart && parsedEndExclusive) {
        if (parsedStart >= parsedEndExclusive) {
            throw new common_1.BadRequestException('fromDate cannot be after toDate');
        }
    }
    return {
        startDate: parsedStart,
        endDateExclusive: parsedEndExclusive,
        isFiltered: true,
    };
}
//# sourceMappingURL=date-range.util.js.map