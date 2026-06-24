import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AgencyPreferences } from "./agency";

/**
 * Updates the preferences for a specific agency.
 * @param agencyId The ID of the agency to update.
 * @param preferences The new preferences to merge.
 */
export const updateAgencyPreferences = async (
  agencyId: string,
  preferences: Partial<AgencyPreferences>
): Promise<void> => {
  try {
    const agencyRef = doc(db, "agencies", agencyId);
    
    // We update the specific nested fields within 'preferences'
    const updatePayload: Record<string, any> = {};
    if (preferences.preferredLocations !== undefined) {
      updatePayload["preferences.preferredLocations"] = preferences.preferredLocations;
    }
    if (preferences.preferredPropertyTypes !== undefined) {
      updatePayload["preferences.preferredPropertyTypes"] = preferences.preferredPropertyTypes;
    }

    if (Object.keys(updatePayload).length > 0) {
      await updateDoc(agencyRef, updatePayload);
    }
  } catch (error) {
    console.error("Error updating agency preferences:", error);
    throw new Error("Failed to update preferences");
  }
};
