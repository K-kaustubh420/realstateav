import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Property } from "./property.types";
import { mapPropertyToAgency } from "./agencyProperty";
import { cleanUndefinedFields } from "./utils";

export const createProperty = async (
  propertyData: Omit<Property, "id" | "views" | "postedAt" | "verified">,
  agentInfo?: { uid: string; fullName: string }
): Promise<string> => {
  const propertiesCol = collection(db, "properties");
  const newPropertyRef = doc(propertiesCol);
  const id = newPropertyRef.id;

  const defaultTitle = propertyData.title || `${propertyData.bhk ? `${propertyData.bhk} BHK ` : ""}${propertyData.propertyType} in ${propertyData.location}`;

  const finalProperty: Property = {
    ...propertyData,
    id,
    title: defaultTitle,
    views: 0,
    postedAt: Date.now(),
    verified: false,
  };

  if (agentInfo) {
    finalProperty.agentId = agentInfo.uid;
    finalProperty.agentName = agentInfo.fullName;
  }

  await setDoc(newPropertyRef, cleanUndefinedFields(finalProperty));

  // If listed under an agency, map the listing under the agent's record
  if (finalProperty.listedUnderAgency && finalProperty.agencyId && finalProperty.agentId) {
    await mapPropertyToAgency(
      finalProperty.agencyId,
      finalProperty.agentId,
      id,
      defaultTitle
    );
  }

  return id;
};
