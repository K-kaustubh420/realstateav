import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { Property } from "../properties/property.types";
import { cleanUndefinedFields } from "../properties/utils";

/**
 * Creates a new draft property listed by a user.
 * Users can only create draft_for_sale or draft_for_rental with status = "draft".
 */
export const createUserDraft = async (
  propertyData: Omit<Property, "id" | "views" | "postedAt" | "verified" | "status" | "agentId" | "agentName">,
  userEmail: string,
  userId: string,
  userName?: string
): Promise<string> => {
  const propertiesCol = collection(db, "properties");
  const newPropertyRef = doc(propertiesCol);
  const id = newPropertyRef.id;

  const defaultTitle =
    propertyData.title ||
    `${propertyData.bhk ? `${propertyData.bhk} BHK ` : ""}${propertyData.propertyType} in ${propertyData.location}`;

  // Users can only create drafts (either draft_for_sale or draft_for_rental)
  const propertyScene =
    propertyData.property_scene === "draft_for_rental" ||
    propertyData.property_scene === "on_rent"
      ? "draft_for_rental"
      : "draft_for_sale";

  const finalProperty: Property = {
    ...propertyData,
    id,
    title: defaultTitle,
    views: 0,
    postedAt: Date.now(),
    verified: false,
    status: "draft",
    property_scene: propertyScene as any,
    userId,
    userEmail,
    userName: userName || userEmail.split("@")[0],
    agentId: null as any, // Stored as null per requirements
    agentName: null as any, // Stored as null per requirements
    amenities: propertyData.amenities || [],
    images: propertyData.images || [],
    coordinates: propertyData.coordinates || { lat: 0, lng: 0 },
    expectedPrice: Number(propertyData.expectedPrice) || 0,
  };

  await setDoc(newPropertyRef, cleanUndefinedFields(finalProperty));
  return id;
};

/**
 * Updates a user-created draft. Only succeeds if the property has status === "draft" and agentId === null.
 */
export const updateUserDraft = async (
  propertyId: string,
  updatedData: Partial<Property>,
  email: string
): Promise<void> => {
  const propertyRef = doc(db, "properties", propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) {
    throw new Error("Property not found.");
  }

  const existing = snap.data() as Property;

  if (existing.userEmail !== email) {
    throw new Error("You do not have permission to edit this property.");
  }

  if (existing.status !== "draft" || existing.agentId !== null) {
    throw new Error("This property is already managed by an agent and cannot be edited.");
  }

  const newTitle =
    updatedData.title ||
    existing.title ||
    `${existing.bhk ? `${existing.bhk} BHK ` : ""}${existing.propertyType} in ${existing.location}`;

  await updateDoc(
    propertyRef,
    cleanUndefinedFields({
      ...updatedData,
      title: newTitle,
    })
  );
};

/**
 * Deletes a user-created draft permanently. Only succeeds if the property has status === "draft" and agentId === null.
 */
export const deleteUserDraft = async (propertyId: string, email: string): Promise<void> => {
  const propertyRef = doc(db, "properties", propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) {
    throw new Error("Property not found.");
  }

  const existing = snap.data() as Property;

  if (existing.userEmail !== email) {
    throw new Error("You do not have permission to delete this property.");
  }

  if (existing.agentId !== null) {
    throw new Error("This property has been assigned to an agent and cannot be permanently deleted.");
  }

  await deleteDoc(propertyRef);
};

/**
 * Fetches user dashboard properties:
 * A. Properties listed by the user (where userEmail === email)
 * B. Properties the user marked interested in (where interestedUserIds array contains uid)
 */
export const fetchUserDashboardProperties = async (
  email: string,
  uid: string
): Promise<{ listed: Property[]; interested: Property[] }> => {
  if (!email || !uid) {
    return { listed: [], interested: [] };
  }

  const propertiesCol = collection(db, "properties");

  const listedQuery = query(propertiesCol, where("userEmail", "==", email));
  const interestedQuery = query(propertiesCol, where("interestedUserIds", "array-contains", uid));

  const [listedSnap, interestedSnap] = await Promise.all([
    getDocs(listedQuery),
    getDocs(interestedQuery),
  ]);

  const listed: Property[] = [];
  listedSnap.forEach((doc) => {
    listed.push(doc.data() as Property);
  });

  const interested: Property[] = [];
  interestedSnap.forEach((doc) => {
    interested.push(doc.data() as Property);
  });

  // Sort by postedAt descending
  listed.sort((a, b) => b.postedAt - a.postedAt);
  interested.sort((a, b) => b.postedAt - a.postedAt);

  return { listed, interested };
};

/**
 * Fetches all active properties in the marketplace with optional filter for sale vs rental.
 */
export const fetchActiveProperties = async (
  propertySceneFilter?: "sale" | "rental"
): Promise<Property[]> => {
  const propertiesCol = collection(db, "properties");
  let activeQuery = query(propertiesCol, where("status", "==", "active"));

  if (propertySceneFilter === "sale") {
    activeQuery = query(
      propertiesCol,
      where("status", "==", "active"),
      where("property_scene", "in", ["on_sale", "sell_and_rent"])
    );
  } else if (propertySceneFilter === "rental") {
    activeQuery = query(
      propertiesCol,
      where("status", "==", "active"),
      where("property_scene", "in", ["on_rent", "sell_and_rent"])
    );
  }

  const snap = await getDocs(activeQuery);
  const properties: Property[] = [];
  snap.forEach((doc) => {
    properties.push(doc.data() as Property);
  });

  // Sort by postedAt descending
  properties.sort((a, b) => b.postedAt - a.postedAt);

  return properties;
};

/**
 * Toggles user interest in a property doc.
 */
export const toggleInterest = async (
  propertyId: string,
  uid: string,
  isInterested: boolean
): Promise<void> => {
  if (!propertyId || !uid) return;
  const propertyRef = doc(db, "properties", propertyId);

  if (isInterested) {
    await updateDoc(propertyRef, {
      interestedUserIds: arrayUnion(uid),
    });
  } else {
    await updateDoc(propertyRef, {
      interestedUserIds: arrayRemove(uid),
    });
  }
};
