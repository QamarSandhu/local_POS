import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicensingService } from './licensing.service';
export declare const SKIP_LICENSE_CHECK_KEY = "skipLicenseCheck";
export declare const SkipLicenseCheck: () => (target: any, key?: any, descriptor?: any) => any;
export declare class LicenseGuard implements CanActivate {
    private readonly reflector;
    private readonly licensingService;
    constructor(reflector: Reflector, licensingService: LicensingService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
