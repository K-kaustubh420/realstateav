import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Property } from "./property.types";
import { unmapPropertyFromAgency } from "./agencyProperty";

export const deleteProperty = async (
  propertyId: string,
  agentId: string
): Promise<void> => {
  const propertyRef = doc(db, "properties", propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) {
    throw new Error("Property not found.");
  }

  const property = snap.data() as Property;

  // Authorization check: Only the listing agent can delete
  if (property.agentId !== agentId) {
    throw new Error("You do not have permission to delete this property.");
  }

  // Rule: User-created draft properties cannot be deleted
  if (property.userId) {
    throw new Error("User-created draft properties cannot be deleted. You can only revert them to draft or mark them sold/rented.");
  }

  // Unmap from agency lists
  if (property.listedUnderAgency && property.agencyId && property.agentId) {
    await unmapPropertyFromAgency(property.agencyId, property.agentId, propertyId);
  }

  await deleteDoc(propertyRef);
};
