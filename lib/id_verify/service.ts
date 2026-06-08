"use server";

import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import crypto from 'crypto';
import { getLatestAgentKey, getKeyById } from './keys';
import { canonicalize, sha256 } from './crypto';
import { PayloadAgentIDVerify, PayloadAgencyIDVerify, DocumentDetails } from '@/utils/id_verify';

export type VerificationRequest = {
    id: string;
    data: PayloadAgentIDVerify | PayloadAgencyIDVerify; 
    status: string;
    submittedAt: string; 
};

/**
 * Submits Agent KYC / ID Verification Request
 */
export async function submitAgentKYC(payload: any) {
    try {
        if (!payload.role || !payload.agent_id) {
            throw new Error("Missing required role or agent ID");
        }

        if (payload.role !== 'agent') {
            throw new Error("This service handles agent KYC only. Agency logic separated.");
        }

        const uid = payload.agent_id;
        const timestamp = Timestamp.now();
        const issuedAtMillis = timestamp.toMillis();

        const { privateKey, keyId } = await getLatestAgentKey(uid);

        const documentData = payload.documentDetails;
        const documentCanonical = canonicalize(documentData);
        const documentHash = sha256(documentCanonical);

        // Compute metadata hash for immutability
        const metadataCanonical = canonicalize(payload.metadata || {});
        const metadataHash = sha256(metadataCanonical);
        
        // Compute personal details hash (fullName, email)
        const personalDetails = { fullName: payload.fullName, email: payload.email };
        const personalCanonical = canonicalize(personalDetails);
        const personalHash = sha256(personalCanonical);

        const payloadToSign = {
            uid: uid,
            role: payload.role,
            fingerprint: payload.metadata?.device_fingerprint_hash || "",
            document_hash: documentHash, 
            metadata_hash: metadataHash,
            personal_hash: personalHash,
            issued_at: issuedAtMillis,
            key_id: keyId
        };

        const canonicalString = canonicalize(payloadToSign);
        const finalHashToSign = sha256(canonicalString);

        const signer = crypto.createSign('SHA256');
        signer.update(finalHashToSign);
        signer.end();
        const serverSignature = signer.sign(privateKey, 'base64');

        const finalPayload: PayloadAgentIDVerify = {
            ...payload,
            digitalSignature: serverSignature, 
            recivedAt: timestamp,
            verification_payload: payloadToSign,
            verificationKeyId: keyId,
            version: "v2"
        };

        const idVerifyDocRef = doc(db, "id_verify", uid);
        const userDocRef = doc(db, "agents", uid); 

        let locationString = "";
        if (documentData?.permanent_address) {
             locationString = documentData.permanent_address.city + ", " + documentData.permanent_address.country;
        }

        await runTransaction(db, async (transaction) => {
            transaction.set(idVerifyDocRef, {
                ...finalPayload,
                status: 'pending_review',
                updatedAt: timestamp
            });

            const agentUpdateData: any = {
                id_verify: 'pending',
                idVerifyDocRef: {
                    doc_path: `id_verify/${uid}`,
                    submittedAt: timestamp,
                    status: 'pending',
                    last_signature: serverSignature
                }
            };
            
            if (locationString) {
                 agentUpdateData.location_string = locationString; // Using location_string to not conflict with geo location
            }
            
            transaction.update(userDocRef, agentUpdateData);
        });

        return { success: true, message: "KYC Submitted", signature: serverSignature, keyId };
    } catch (error: any) {
        console.error("KYC Submission Error:", error);
        throw new Error(error.message || "Internal Server Error");
    }
}

/**
 * Verify Agent Data Integrity
 */
export async function verifyAgentIntegrity(uid: string) {
    try {
        const docRef = doc(db, "id_verify", uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
             throw new Error("Document not found");
        }

        const data = docSnap.data();
        const role = data.role;
        const keyId = data.verificationKeyId || uid; 
        
        const keyData = await getKeyById(uid, keyId);

        if (!keyData || !keyData.publicKey) {
            return { valid: false, reason: `Security Keys not found for keyId: ${keyId}` };
        }
        
        const publicKeyString = keyData.publicKey; 
        const isV2 = !!data.verification_payload;

        if (isV2) {
            let reCalcDocHash = '';
            let storedDocHash = '';

            if (role === 'agency') {
                const agencyData = data as PayloadAgencyIDVerify;
                const businessDetails = agencyData.businessDocumentDetails;
                const ownerDetails = agencyData.documentDetails_of_owner;

                if (!businessDetails || !ownerDetails) {
                    return { valid: false, reason: "Incomplete Agency Data" };
                }

                const businessCanonical = canonicalize(businessDetails);
                const ownerCanonical = canonicalize(ownerDetails);
                reCalcDocHash = sha256(businessCanonical + ownerCanonical);
                storedDocHash = data.verification_payload.composite_document_hash;
            } else {
                const agentData = data as PayloadAgentIDVerify;
                const documentData = agentData.documentDetails;
                const docCanonical = canonicalize(documentData);
                reCalcDocHash = sha256(docCanonical);
                storedDocHash = data.verification_payload.document_hash;
            }

            if (reCalcDocHash !== storedDocHash) {
                 return { valid: false, reason: `Document Integrity Mismatch.` };
            }

            // Verify Metadata Integrity if v3/extended payload is present
            if (data.verification_payload.metadata_hash) {
                 const metaCanonical = canonicalize(data.metadata || {});
                 const reCalcMetaHash = sha256(metaCanonical);
                 if (reCalcMetaHash !== data.verification_payload.metadata_hash) {
                      return { valid: false, reason: `Metadata Telemetry Integrity Mismatch.` };
                 }
            }

            // Verify Personal Details Integrity if extended payload is present
            if (data.verification_payload.personal_hash) {
                 const personalDetails = { fullName: data.fullName, email: data.email };
                 const personalCanonical = canonicalize(personalDetails);
                 const reCalcPersonalHash = sha256(personalCanonical);
                 if (reCalcPersonalHash !== data.verification_payload.personal_hash) {
                      return { valid: false, reason: `Personal Details Integrity Mismatch.` };
                 }
            }

            const payloadCanonical = canonicalize(data.verification_payload);
            const finalHashToVerify = sha256(payloadCanonical);

            const verify = crypto.createVerify('SHA256');
            verify.update(finalHashToVerify);
            verify.end();

            const isValid = verify.verify(publicKeyString, data.digitalSignature, 'base64');

            return {
                valid: isValid, 
                role: role,
                checkedAt: new Date().toISOString(),
                keyId: keyId,
                strategy: 'v2'
            };

        } else {
            // Legacy check
            const timestamp = data.recivedAt; 
            const documentDataForSigning = (data as PayloadAgentIDVerify).documentDetails;
            const storedFingerprint = data.metadata?.device_fingerprint_hash 
                || data.metadata?.client_side?.device_fingerprint_hash 
                || '';

            const payloadToVerify = {
                uid: uid,
                role: role,
                fingerprint: storedFingerprint,
                document_data: documentDataForSigning,
                server_timestamp: timestamp.toMillis() 
            };

            const stringToVerify = JSON.stringify(payloadToVerify);
            
            const verify = crypto.createVerify('SHA256');
            verify.update(stringToVerify);
            verify.end();

            const isValid = verify.verify(publicKeyString, data.digitalSignature, 'base64');
            
            return {
                valid: isValid, 
                role: role,
                checkedAt: new Date().toISOString(),
                keyId: keyId,
                strategy: 'legacy'
            };
        }
    } catch (error: any) {
        console.error("Verification failed:", error);
        throw new Error(error.message || "Verification failed");
    }
}

/**
 * Process KYC Decision
 */
export async function processDecision(uid: string, decision: 'verified' | 'rejected', adminId: string = 'admin') {
    try {
        await runTransaction(db, async (transaction) => {
            const idVerifyRef = doc(db, "id_verify", uid);
            const idVerifyDoc = await transaction.get(idVerifyRef);
            
            if (!idVerifyDoc.exists()) {
                throw new Error("Document does not exist!");
            }

            const data = idVerifyDoc.data();
            const role = data.role; 
            const timestamp = Timestamp.now();

            const kycUpdates: Record<string, any> = { 
                id_verify: decision,
                "KYCDetails.status": decision,
                "KYCDetails.verifiedAt": timestamp,
                "KYCDetails.verifiedBy": adminId
            };

            if (role === 'agent') {
                const agentRef = doc(db, 'agents', uid);
                
                if (decision === 'verified') {
                    kycUpdates['canaddproperty'] = true;
                }
                
                transaction.update(agentRef, kycUpdates);
            } else if (role === 'agency') {
                const agencyRef = doc(db, 'agency', uid);
                const agentRef = doc(db, 'agents', uid); 

                const agencyUpdates = { ...kycUpdates }; 
                if (decision === 'verified') {
                    agencyUpdates['canaddproperty'] = true;
                    agencyUpdates['canaddagents'] = true;
                }
                transaction.update(agencyRef, agencyUpdates);

                const agentDocUpdates: Record<string, any> = {
                    id_verify: decision
                };
                if (decision === 'verified') {
                    agentDocUpdates['canaddproperty'] = true;
                }
                transaction.update(agentRef, agentDocUpdates);
            }

            transaction.update(idVerifyRef, { 
                status: decision, 
                verifiedAt: timestamp, 
                verifiedBy: adminId 
            });
        });
        
        return { success: true, message: `Successfully ${decision} KYC for ${uid}` };
    } catch(err: any) {
        console.error("Error processing decision:", err);
        throw new Error(err.message || "Error processing decision");
    }
}

// Helper to convert Firebase Timestamps to ISO strings for Next.js Client Components
function convertTimestamps(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (typeof obj.toDate === 'function' && typeof obj.toMillis === 'function') {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(convertTimestamps);
    }
    const newObj: any = {};
    for (const key in obj) {
        newObj[key] = convertTimestamps(obj[key]);
    }
    return newObj;
}

/**
 * Fetch Pending Requests
 */
export async function fetchPendingRequests(): Promise<VerificationRequest[]> {
    try {
        const q = query(collection(db, "id_verify"), where("status", "==", "pending_review"));
        const querySnapshot = await getDocs(q);
        
        const list: VerificationRequest[] = [];
        
        for (const docSnap of querySnapshot.docs) {
            const rawData = docSnap.data();
            const safeData = convertTimestamps(rawData);
            
            const submittedDate = rawData.recivedAt && typeof rawData.recivedAt.toDate === 'function'
                ? rawData.recivedAt.toDate().toISOString() 
                : new Date().toISOString();

            if (rawData.role === 'agent') {
                // Fetch agent name and email dynamically if missing
                if (!safeData.fullName || !safeData.email) {
                    try {
                        const agentSnap = await getDoc(doc(db, "agents", docSnap.id));
                        if (agentSnap.exists()) {
                            const agentData = agentSnap.data();
                            safeData.fullName = safeData.fullName || agentData.fullName || `${agentData.name?.firstname || ''} ${agentData.name?.lastname || ''}`.trim();
                            safeData.email = safeData.email || agentData.email;
                        }
                    } catch (e) {
                        console.warn("Failed to load agent profile data for", docSnap.id);
                    }
                }

                list.push({
                    id: docSnap.id,
                    status: rawData.status,
                    submittedAt: submittedDate,
                    data: safeData as PayloadAgentIDVerify
                });
            } else if (rawData.role === 'agency') {
                list.push({
                    id: docSnap.id,
                    status: rawData.status,
                    submittedAt: submittedDate,
                    data: safeData as PayloadAgencyIDVerify
                });
            }
        }
        
        return list;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw new Error("Failed to load verification queue");
    }
}
