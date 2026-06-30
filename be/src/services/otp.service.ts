import { authenticator } from "otplib";
import { sendOTPEmail } from "@/helper/email.sender";

const otpStore = new Map<string, {
  otp: string;
  expiresAt: number;
}>();

authenticator.options = {
  digits: 6,
};

export const generateAndSendOTP = async (email: string) => {
  const secret = `${email}_${process.env.OTP_SECRET}`;

  // hết hạn 5 phút
  const otp = authenticator.generate(secret);

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOTPEmail(email, otp);
};

export const verifyOTP = (
  email: string,
  inputOtp: string
): boolean => {
  const record = otpStore.get(email);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (record.otp !== inputOtp) {
    return false;
  }

  otpStore.delete(email);

  return true;
};