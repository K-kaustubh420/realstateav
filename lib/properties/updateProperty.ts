import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Property } from "./property.types";
import { mapPropertyToAgency, unmapPropertyFromAgency } from "./agencyProperty";
import { cleanUndefinedFields } from "./utils";

export const updateProperty = async (
  propertyId: string,
  updatedData: Partial<Property>,
  agentId: string
): Promise<void> => {
  const propertyRef = doc(db, "properties", propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) {
    throw new Error("Property not found.");
  }

  const existing = snap.data() as Property;

  // Authorization check: Only the owner agent can update
  if (existing.agentId !== agentId) {
    throw new Error("You do not have permission to edit this property.");
  }

  const oldAgencyId = existing.listedUnderAgency ? existing.agencyId : undefined;
  const newAgencyId = updatedData.hasOwnProperty("listedUnderAgency")
    ? (updatedData.listedUnderAgency ? (updatedData.agencyId || existing.agencyId) : undefined)
    : (existing.listedUnderAgency ? existing.agencyId : undefined);

  const newTitle = updatedData.title || existing.title || `${existing.bhk ? `${existing.bhk} BHK ` : ""}${existing.propertyType} in ${existing.location}`;

  // Perform the document update
  await updateDoc(propertyRef, cleanUndefinedFields({
    ...updatedData,
    title: newTitle,
  }));

  // Sync with agency mapping if needed
  if (oldAgencyId !== newAgencyId) {
    if (oldAgencyId) {
      await unmapPropertyFromAgency(oldAgencyId, agentId, propertyId);
    }
    if (newAgencyId) {
      await mapPropertyToAgency(newAgencyId, agentId, propertyId, newTitle);
    }
  } else if (newAgencyId && (updatedData.title || updatedData.propertyType || updatedData.location)) {
    // If the agency remained the same but title attributes changed, update mapping title
    await mapPropertyToAgency(newAgencyId, agentId, propertyId, newTitle);
  }
};
