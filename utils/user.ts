// @/utils/user.ts 
import { Timestamp } from "firebase/firestore";
export interface User {
    name : string; 
    email : string; 
    number :  { 
        countrycode : string;
        mobilenumber : string;
    } 
    intent :"buyer" | "seller" | "renter" | "researcher" | "homeowner";
    exploreintent: string[];
    role : "user" | "agent";
    Address : {
        AddressLine1 : string;
        AddressLine2 : string;
        City : string;
        State : string;
        PostalCode : string;
        Country : string;
    } 
    location : {
       longitute: string; 
       latitute : string;
    }
    about : string;
    uid : string; 
    createdAt: Timestamp;
    collection : string[];
    PropertiesVisited : string[]; 
    photoURL : string; 
    onboardingCompleted? : boolean;
} 

/**
 * Agent Interface
 * Note: For optimal queries based on onboarding status, create a Firestore composite index 
 * on the `agents` collection with fields: `id` (ASC) and `onboardingCompleted` (ASC).
 */
export interface Agent {
  fullName: string;
    preferredLocations: string[]; 
    name : {
        firstname : string;
        lastname : string;
    }
    email : string; 
    number : {
        countrycode: string;
        mobilenumber: string;
    }; 
    agency : string | "Null" | "inhouse"; 
    uid : string; 
    role : "agent" | "agency"; 
    membership: {
         transaction_id: string; 
            start_date: Timestamp;
            end_date: Timestamp;
            status: "active" | "inactive" | "pending" | "cancelled";

    };
    
    location : {
       longitute: string; 
       latitute : string;
    }
     id_verify : "unverified" | "pending" | "verified" | "rejected"; 
    properties : string[]; 
    ratings : number[]; 
    about : string; 
    photoURL : string; 
   AgencyDetails? : { 
    agencyname:string;
    agencycode: string;
    agency_id: string;
    agency_address : string ; 
    agency_license_no : string ;  
    agency_pan_no : string ; 
    agency_pan_photo : string ;     
    agency_logo : string ;     
   }    
 IdDetails? : { 
        idurl : string;
        idtype? : "passport" | "driver's license" | "voter ID" | "citizenship" | "pan card";
        addressProof? : string[];  
        selfie? : string; 
        verifiedBy? : string; 
        verifiedAt? : string; 
        rejectedReason? : string;
        PhoneNumber? : string;
        DOB? : string; 
        idno? : string; 
        issuedBy? : string; 
        issuedDate? : string; 
        validTill? : string | 'lifetime';
    }
    canaddproperty : boolean;
     canaddagents : boolean;
     isAgencyOwner?: boolean;
     addedagents? : string[];
     onboardingCompleted?: boolean;
    Address?: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

export interface AgentRegisterPayload extends Omit<Agent, 'membership'> {
    membership: {
        transaction_id: string;
        status: "active" | "inactive" | "pending" | "cancelled";
        start_date: string;
        end_date: string;
    };
}

export interface Admin { 
    email:  string; 
    lastlogin : string; 
    device : string;
    lastloginlocation : string; 
    password: string; 
    trusteddevices : { 
         ipaddress : string; 
         geolocation : string ;
         
    }
}

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface AgentData {
  uid: string;
  email: string;
  role: "agent";
  isVerified?: boolean;
  verificationRequested?: boolean;
  verificationStatus?: VerificationStatus;
  verificationIssue?: string;
  fullName?: string;
  dob?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  idType?: string;
  idNumber?: string;
  idPhotoUrl?: string;
  selfieWithIdUrl?: string;
  profilePhotoUrl?: string;
  submittedAt?: number | null;
  createdAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: "user";
  createdAt: number;
  fullName?: string;
  phoneNumber?: string;
  photoURL?: string;
  permanentAddress?: string;
  isDeleted?: boolean;
  // New lightweight identity fields
  governmentIdType?: string; // e.g., "Passport", "Aadhar"
  governmentIdNumber?: string;
  governmentIdImageUrl?: string;
  isIdentityVerified?: boolean; // default false until verification
  identityConsentAccepted?: boolean; // user self‑declaration consent
}
