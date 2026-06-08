import { Timestamp } from "firebase/firestore";

export interface Metadata {
    device_fingerprint: string;
    device_info_ua: string;
    timezone : string; 
    ip_address: string;
    device_fingerprint_hash: string;
inferredDevice: {
        device_type: string;
        device_brand: string;
        device_model: string;
        os_name: string;
        os_version: string;
    };
    Screenresolution: string; 
    cpucores: number;
    geolocation: {
        country: string;
        region: string;
        city: string;
        latitude: number;
        longitude: number;
    };

} 
export interface DocumentDetails { 
    idtype : "passport" | "driver's license" | "voter ID" | "citizenship" | "pan card" | string; 
    idno : string; 
    DOB? : string;
    issuedBy? : string; 
    issuedDate? : string; 
    validTill? : string | 'lifetime'; 
    id_ImageURL : string;
    
    permanent_address : { 
         addressLine1 : string; 
         addressLine2? : string; 
         city : string; 
         state : string; 
         country : string; 
         postalCode : string; 
    }; 
    mailing_address? : {
         addressLine1 : string; 
         addressLine2? : string; 
         city : string; 
         state : string; 
         country : string; 
         postalCode : string; 
    };

    selfie_ImageURL : string;
    selfie_with_id_ImageURL : string;
}
export interface PayloadAgentIDVerify{ 
    digitalSignature : string;
    metadata: Metadata;  
    documentDetails : DocumentDetails;
    role : "agent"; 
    agent_id : string; 
    fullName? : string;
    email? : string;
    recivedAt : Timestamp; 
}
export interface BusinessDocumentDetails {
  legalName: string;
  registrationType: "sole_proprietorship" | "llp" | "private_limited";
  registrationNumber: string;
  incorporationDate: string;

  taxId: string;

  registeredAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  businessLicenseURL?: string;
}

export interface PayloadAgencyIDVerify{
    digitalSignature : string;
    metadata: Metadata;  
    documentDetails_of_owner : DocumentDetails; 
    businessDocumentDetails : BusinessDocumentDetails;
    role : "agency"; 
    
    agency_id : string; 
    recivedAt : Timestamp; 
}