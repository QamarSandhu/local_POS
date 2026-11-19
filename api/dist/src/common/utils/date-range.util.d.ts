export interface ParsedDateRange {
    startDate?: Date;
    endDateExclusive?: Date;
    isFiltered: boolean;
}
export declare function parseAndValidateDateRange(fromDate?: string, toDate?: string): ParsedDateRange;
