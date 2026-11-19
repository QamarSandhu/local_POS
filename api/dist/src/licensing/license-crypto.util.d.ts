export interface LicensePayload {
    licenseNumber: string;
    businessId: string;
    businessName: string;
    plan?: string;
    issuedAt: string;
    expiresAt: string;
    version: string;
    installationId?: string;
}
export interface VerificationResult {
    valid: boolean;
    payload?: LicensePayload;
    error?: string;
}
export declare function normalizeKey(rawKey: string, type: 'public' | 'private'): string;
export declare function generateLicenseKeyPair(): {
    publicKey: string;
    privateKey: string;
};
export declare function signLicensePayload(payload: LicensePayload, privateKeyInput: string): string;
export declare function verifyLicenseKey(licenseKey: string, publicKeyInput: string): VerificationResult;
