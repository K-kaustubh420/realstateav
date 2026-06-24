import { db } from "../firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

/**
 * Generates a 4-digit OTP, saves it in the 'otps' collection, and sends it to the email.
 * If SMTP credentials are not set, it logs the OTP to the console and succeeds for local development testing.
 */
export async function generateAndSendOtp(email: string): Promise<string> {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 45 * 1000; // 45 seconds from now

  // Save to Firestore under temporary 'otps' collection
  const docRef = doc(db, "otps", email);
  await setDoc(docRef, {
    otp,
    expiresAt,
  });

  console.log(`\n======================================================`);
  console.log(`>>> 📧 OTP FOR ${email} IS: ${otp} <<<`);
  console.log(`======================================================\n`);

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      `>>> [OTP DEV WARNING] Nodemailer credentials EMAIL_USER/EMAIL_PASS are not set. ` +
      `Succeeding verification process automatically for local development testing. <<<`
    );
    return otp;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: '"Bhu Market" <no-reply@bhumarket.com>',
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP is ${otp}. It expires in 45 seconds.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; rounded: 12px;">
          <h2 style="font-size: 24px; color: #18181b; font-weight: bold; margin-bottom: 16px;">Verify Your Email Address</h2>
          <p style="color: #71717a; font-size: 16px; margin-bottom: 24px;">Please use the following 4-digit verification code to complete your verification on Bhu Market.</p>
          <div style="background-color: #f4f4f5; padding: 16px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4AF37; margin-bottom: 24px;">
            ${otp}
          </div>
          <p style="color: #a1a1aa; font-size: 12px;">This code will expire in 45 seconds. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Nodemailer error sending email:", error);
    // During local development, do not fail completely if email sending fails but log is visible
    throw new Error("Failed to send OTP email. Please contact support or check server logs.");
  }

  return otp;
}

/**
 * Verifies if the provided OTP code matches the stored OTP for the email and is not expired.
 * Deletes the OTP record once validated successfully.
 */
export async function verifyOtpCode(
  email: string,
  otpCode: string
): Promise<{ valid: boolean; message?: string }> {
  const docRef = doc(db, "otps", email);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return { valid: false, message: "No OTP found for this email" };
  }

  const data = snapshot.data();
  const now = Date.now();

  if (now > data.expiresAt) {
    return { valid: false, message: "OTP expired" };
  }

  if (data.otp !== otpCode) {
    return { valid: false, message: "Invalid OTP" };
  }

  // OTP is valid - delete the used record
  await deleteDoc(docRef);

  return { valid: true };
}
