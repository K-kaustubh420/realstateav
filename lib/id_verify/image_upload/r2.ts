"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Configure Cloudflare R2 Client
const R2_ACCOUNT_ID = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!;
const BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME!;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a pre-signed URL for uploading a file to R2 directly from the browser.
 * This ensures the file never touches our Next.js backend, improving speed and security.
 */
export async function generateUploadUrl(contentType: string, prefix: string = "docs") {
  try {
    const ext = contentType.split("/")[1] || "jpeg";
    const fileName = `${prefix}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    // URL expires in 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { success: true, url: signedUrl, objectKey: fileName };
  } catch (error: any) {
    console.error("Error generating pre-signed upload URL:", error);
    return { success: false, error: "Failed to generate upload URL." };
  }
}

/**
 * Generates a pre-signed URL to view a private file securely.
 */
export async function generateViewUrl(objectKey: string) {
  try {
    if (!objectKey) return { success: false, error: "No object key provided." };

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    });

    // View URL expires in 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return { success: true, url: signedUrl };
  } catch (error: any) {
    console.error("Error generating pre-signed view URL:", error);
    return { success: false, error: "Failed to generate view URL." };
  }
}
