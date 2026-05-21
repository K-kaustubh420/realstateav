import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Property, PropertyScene, PropertyStatus } from "./property.types";
import { mapPropertyToAgency, unmapPropertyFromAgency } from "./agencyProperty";
import { cleanUndefinedFields } from "./utils";

export const updatePropertyStatus = async (
  propertyId: string,
  agentId: string,
  agentName: string,
  newScene: PropertyScene,
  newStatus: PropertyStatus,
  agencyInfo?: { agencyId: string; agencyName: string } // Optional agency info if mapping/activating
): Promise<void> => {
  const propertyRef = doc(db, "properties", propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) {
    throw new Error("Property not found.");
  }

  const property = snap.data() as Property;
  const isUnclaimedUserDraft = !!property.userId && !property.agentId;

  // Authorization check: Must be unclaimed user draft, or the listing agent
  if (!isUnclaimedUserDraft && property.agentId !== agentId) {
    throw new Error("You do not have permission to manage this property's lifecycle.");
  }

  const updates: Partial<Property> = {
    property_scene: newScene,
    status: newStatus,
  };

  // If claiming/activating an unclaimed user draft
  if (isUnclaimedUserDraft && newStatus === "active") {
    updates.agentId = agentId;
    updates.agentName = agentName;

    if (agencyInfo?.agencyId) {
      updates.listedUnderAgency = true;
      updates.agencyId = agencyInfo.agencyId;
      updates.agencyName = agencyInfo.agencyName;
      updates.listingType = "agency";
    } else {
      updates.listedUnderAgency = false;
      updates.listingType = "individual";
    }

    // Map to agency if needed
    const currentTitle = property.title || `${property.bhk ? `${property.bhk} BHK ` : ""}${property.propertyType} in ${property.location}`;
    if (agencyInfo?.agencyId) {
      await mapPropertyToAgency(agencyInfo.agencyId, agentId, propertyId, currentTitle);
    }
  }

  // Handle syncing agency mapping if status changed to inactive (sold, rented, draft)
  if (property.listedUnderAgency && property.agencyId && property.agentId) {
    if (newStatus !== "active") {
      // Remove from agency listing view since it is no longer active
      await unmapPropertyFromAgency(property.agencyId, property.agentId, propertyId);
    } else if (property.status !== "active") {
      // Re-map to agency if it is becoming active again
      const currentTitle = property.title || `${property.bhk ? `${property.bhk} BHK ` : ""}${property.propertyType} in ${property.location}`;
      await mapPropertyToAgency(property.agencyId, property.agentId, propertyId, currentTitle);
    }
  }

  await updateDoc(propertyRef, cleanUndefinedFields(updates));
};
