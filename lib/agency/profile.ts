import { updateAgency, AgencyDetails } from "./agency";

/**
 * Updates the agency profile details.
 * @param agencyId The ID of the agency
 * @param agencyName The new agency name
 * @param details The updated details object
 */
export const updateAgencyProfile = async (
  agencyId: string,
  agencyName: string,
  details: Partial<AgencyDetails>
): Promise<void> => {
  try {
    await updateAgency(agencyId, {
      agencyName,
      details,
    });
  } catch (error) {
    console.error("Error updating agency profile:", error);
    throw new Error("Failed to update profile");
  }
};
