"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeKey = normalizeKey;
exports.generateLicenseKeyPair = generateLicenseKeyPair;
exports.signLicensePayload = signLicensePayload;
exports.verifyLicenseKey = verifyLicenseKey;
const crypto = require("crypto");
function normalizeKey(rawKey, type) {
    if (!rawKey) {
        throw new Error(`Missing ${type} key`);
    }
    const trimmed = rawKey.trim();
    if (trimmed.includes('BEGIN') && trimmed.includes('KEY')) {
        return trimmed;
    }
    const header = type === 'public' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN PRIVATE KEY-----';
    const footer = type === 'public' ? '-----END PUBLIC KEY-----' : '-----END PRIVATE KEY-----';
    return `${header}\n${trimmed}\n${footer}`;
}
function generateLicenseKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const extractBase64 = (pem) => pem
        .replace(/-----[^\n]+-----/g, '')
        .replace(/\s+/g, '')
        .trim();
    return {
        publicKey: extractBase64(publicKey),
        privateKey: extractBase64(privateKey),
    };
}
function signLicensePayload(payload, privateKeyInput) {
    const privateKeyPem = normalizeKey(privateKeyInput, 'private');
    const payloadJson = JSON.stringify(payload);
    const payloadBuffer = Buffer.from(payloadJson, 'utf8');
    const privateKeyObject = crypto.createPrivateKey({
        key: privateKeyPem,
        format: 'pem',
    });
    const signatureBuffer = crypto.sign(null, payloadBuffer, privateKeyObject);
    const encodedPayload = payloadBuffer.toString('base64url');
    const encodedSignature = signatureBuffer.toString('base64url');
    return `LBI.${encodedPayload}.${encodedSignature}`;
}
function verifyLicenseKey(licenseKey, publicKeyInput) {
    if (!licenseKey || typeof licenseKey !== 'string') {
        return { valid: false, error: 'License key is missing or invalid' };
    }
    const parts = licenseKey.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'LBI') {
        return { valid: false, error: 'Malformed license key format. Expected LBI.<payload>.<signature>' };
    }
    const [, encodedPayload, encodedSignature] = parts;
    try {
        const payloadBuffer = Buffer.from(encodedPayload, 'base64url');
        const signatureBuffer = Buffer.from(encodedSignature, 'base64url');
        const publicKeyPem = normalizeKey(publicKeyInput, 'public');
        const publicKeyObject = crypto.createPublicKey({
            key: publicKeyPem,
            format: 'pem',
        });
        const isVerified = crypto.verify(null, payloadBuffer, publicKeyObject, signatureBuffer);
        if (!isVerified) {
            return { valid: false, error: 'Cryptographic signature verification failed. Invalid or tampered key.' };
        }
        const payload = JSON.parse(payloadBuffer.toString('utf8'));
        if (!payload.licenseNumber || !payload.businessId || !payload.expiresAt) {
            return { valid: false, error: 'License payload is missing required fields' };
        }
        const expiryDate = new Date(payload.expiresAt);
        if (isNaN(expiryDate.getTime())) {
            return { valid: false, error: 'Invalid expiry date format in license payload' };
        }
        return {
            valid: true,
            payload,
        };
    }
    catch (err) {
        return {
            valid: false,
            error: `License verification failed: ${err.message}`,
        };
    }
}
//# sourceMappingURL=license-crypto.util.js.map