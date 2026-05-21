/**
 * Recursively removes all keys with undefined values from an object.
 * This is crucial because Firestore throws an error if any field value is undefined.
 */
export const cleanUndefinedFields = <T extends object>(obj: T): T => {
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        if (val !== null && typeof val === "object" && !Array.isArray(val)) {
          result[key] = cleanUndefinedFields(val as any);
        } else {
          result[key] = val;
        }
      }
    }
  }
  return result;
};
