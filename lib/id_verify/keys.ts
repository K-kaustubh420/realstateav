import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import crypto from 'crypto';

export interface KeyPairData {
    privateKey: string;
    publicKey: string;
    createdAt: string;
    status: 'active' | 'revoked';
    keyId: string;
}

/**
 * Retrieves the specific key implementation for verification
 */
export async function getKeyById(agentId: string, keyId: string): Promise<KeyPairData | null> {
    if (!agentId || !keyId) return null;
    
    // 1. Try fetching from new versioned path
    const keyRef = doc(db, 'sys', agentId, 'keys', keyId);
    const keySnap = await getDoc(keyRef);
    
    if (keySnap.exists()) {
        return keySnap.data() as KeyPairData;
    }
    
    // 2. Fallback: Check legacy path if keyId matches agentId (legacy behavior)
    if (keyId === agentId) {
        const sysRef = doc(db, 'sys', agentId);
        const sysSnap = await getDoc(sysRef);
        if (sysSnap.exists()) {
           const data = sysSnap.data();
           // Construct a pseudo-KeyData for legacy keys
           return {
               privateKey: data.privateKey,
               publicKey: data.publicKey,
               createdAt: data.createdAt || new Date().toISOString(),
               status: 'active',
               keyId: agentId
           };
        }
    }

    return null;
}

/**
 * Retrieves the LATEST ACTIVE key for an agent to sign with.
 * If none exists, generates a new versioned key.
 */
export async function getLatestAgentKey(agentId: string): Promise<KeyPairData> {
    if (!agentId) throw new Error("Agent ID is required to generate keys");

    const keysCollection = collection(db, 'sys', agentId, 'keys');

    // 1. Try to find the latest active key
    const q = query(
        keysCollection, 
        orderBy('createdAt', 'desc'), 
        limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const latestKeyDoc = querySnapshot.docs[0];
        const data = latestKeyDoc.data() as KeyPairData;
        if (data.status === 'active') {
            return data;
        }
    }

    // 2. If no versioned keys found, check if legacy key exists and migrate it?
    // For now, we will just generate a NEW key to ensure crypto-correctness going forward.
    // The legacy key remains in /sys/{uid} for verifying old records if needed.
    
    console.log(`[KEYS] Generating new Versioned KeyPair for Agent: ${agentId}`);
    
    const keyId = crypto.randomUUID();
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    const newKeyData: KeyPairData = {
        keyId,
        privateKey,
        publicKey,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    // Save to /sys/{agentId}/keys/{keyId}
    await setDoc(doc(keysCollection, keyId), newKeyData);
    
    return newKeyData;
}
