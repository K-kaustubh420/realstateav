export type PropertyScene =
  | "on_sale"
  | "on_rent"
  | "sell_and_rent"
  | "draft_for_sale"
  | "draft_for_rental"
  | "sold"
  | "rented";

export type PropertyStatus = "active" | "draft" | "sold" | "rented";

export interface Property {
  id: string;

  // Ownership
  agentId?: string; // UID of the listing agent
  agentName?: string; // Full name of the listing agent

  listedUnderAgency: boolean;
  agencyId?: string;
  agencyName?: string;
  listingType: "individual" | "agency";

  // Draft/User Source
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userPermanentAddress?: string;
  userIdProofUrl?: string;

  // Lifecycle
  property_scene: PropertyScene;
  status: PropertyStatus;

  // Type
  propertyType: string;

  // Location
  location: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  bhk?: number;

  floor?: number;
  totalFloors?: number;

  carpetArea?: number;
  builtUpArea?: number;
  landArea?: number;

  // Pricing
  expectedPrice: number;
  maintenance?: number;

  // Details
  condition?: string;
  renovation?: string;
  description: string;

  amenities: string[];
  images: string[];

  // Moderation
  verified: boolean;

  // Analytics
  views: number;

  // Metadata
  postedAt: number;
  title?: string; // Title field for mapped references and listing display
}

export type AgencyProperty = {
  propertyId: string;
  propertyTitle?: string;
  agencyId?: string;
  agentId?: string;
  agentName?: string;
};
