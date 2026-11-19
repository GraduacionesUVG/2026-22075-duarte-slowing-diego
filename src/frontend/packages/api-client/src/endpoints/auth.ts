import { apiRequest } from "../client";
import type { RegisterIn, RegisterOut, VerifyOtpIn, VerifyOtpOut } from "../types";

export const authApi = {
  register: (data: RegisterIn) => apiRequest<RegisterOut>("/auth/register", { method: "POST", body: data }),
  verifyOtp: (data: VerifyOtpIn) => apiRequest<VerifyOtpOut>("/auth/verify-otp", { method: "POST", body: data }),
};
