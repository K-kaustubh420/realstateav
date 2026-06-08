/**
 * RFC 8785 Compliant JSON Canonicalization Scheme (JCS)
 * 
 * Ensures deterministic string representation of JSON data for cryptographic operations.
 */
export function canonicalize(value: any): string {
    if (value === undefined) {
        throw new Error("Cannot canonicalize undefined value");
    }
    
    // Functions and Symbols are not JSON serializable
    if (typeof value === 'function' || typeof value === 'symbol') {
        throw new Error(`Cannot canonicalize type: ${typeof value}`);
    }

    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        // Arrays: Map canonicalize over elements
        const items = value.map(item => canonicalize(item));
        return `[${items.join(',')}]`;
    }

    // Objects: Sort keys and join
    const keys = Object.keys(value).sort();
    const entries = keys.map(key => {
        const val = value[key];
        // JSON.stringify skips undefined values in objects, so we should too (or throw, depending on strictness).
        if (val === undefined) return null; 
        
        return `${JSON.stringify(key)}:${canonicalize(val)}`;
    }).filter(entry => entry !== null); // Filter out undefined properties

    return `{${entries.join(',')}}`;
}

import crypto from 'crypto';

/**
 * Creates a salted SHA-256 hash of the input string or buffer
 */
export function sha256(data: string | Buffer): string {
    // Add salt to the hashing algorithm to ensure verification robustness
    const salt = process.env.KYC_HASH_SALT || '';
    if (!salt) {
        console.warn("[WARNING] KYC_HASH_SALT environment variable is not set. Hash will be unsalted.");
    }

    // Mix data and salt securely
    const payloadToHash = typeof data === 'string' ? data + salt : Buffer.concat([data, Buffer.from(salt)]);

    return crypto.createHash('sha256').update(payloadToHash).digest('hex');
}
