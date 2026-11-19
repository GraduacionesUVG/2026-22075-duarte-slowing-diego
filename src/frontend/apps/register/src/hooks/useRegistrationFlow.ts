import { useCallback, useState } from "react";
import { ApiError, authApi } from "@repo/api-client";
import type { RegistrationConflictDetail } from "@repo/api-client";
import { friendlyError } from "../lib/errors";

export type RegistrationScreen = "form" | "otp" | "success" | "conflict";

const COUNTRY_PREFIX = "+502";
const WHATSAPP_BOT_LINK = import.meta.env.VITE_WHATSAPP_BOT_LINK ?? "https://wa.me/50280133587";

function maskWhatsappNumber(number: string): string {
  return number.length <= 4 ? number : "X".repeat(number.length - 4) + number.slice(-4);
}

// El bot le pega el wa_id (tal como lo manda Meta, sin "+") al login_url fijo
// como ?wa=... -- así la página lo lee y precarga el número, sin que el
// estudiante tenga que escribirlo. `wa_id` viene con el 502 de Guatemala
// pegado (ej. "50239058221"); acá se le quita para dejar solo los 8 dígitos
// que espera el input (el "+502" ya lo antepone el formulario aparte).
function phoneFromWaParam(): string {
  const wa = new URLSearchParams(window.location.search).get("wa");
  if (!wa) return "";
  const digits = wa.replace(/\D/g, "");
  return digits.startsWith("502") ? digits.slice(3) : digits;
}

export function useRegistrationFlow() {
  const [screen, setScreen] = useState<RegistrationScreen>("form");

  const initialPhone = phoneFromWaParam();
  const [phone, setPhone] = useState(initialPhone);
  const [phoneLocked] = useState(/^\d{8}$/.test(initialPhone));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [consent, setConsent] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState<number | null>(null);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);

  const [existingNumberMasked, setExistingNumberMasked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = COUNTRY_PREFIX + phone;
  const maskedPhone = maskWhatsappNumber(whatsappNumber);

  const canSubmit =
    /^\d{8}$/.test(phone) && fullName.trim() !== "" && email.trim() !== "" && studentId.trim() !== "" && consent;

  const doRegister = useCallback(
    async (confirmReplace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authApi.register({
          whatsapp_number: whatsappNumber,
          full_name: fullName,
          email,
          student_id: studentId,
          confirm_replace: confirmReplace,
        });
        setExpiresInMinutes(result.expires_in_minutes);
        setDebugOtpCode(result.debug_otp_code ?? null);
        setOtpCode("");
        setScreen("otp");
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const detail = err.body && typeof err.body === "object" ? (err.body as Record<string, unknown>).detail : undefined;
          const conflict = detail as RegistrationConflictDetail | undefined;
          setExistingNumberMasked(conflict?.existing_number_masked ?? null);
          setScreen("conflict");
          return;
        }
        setError(friendlyError(err, "register"));
      } finally {
        setLoading(false);
      }
    },
    [whatsappNumber, fullName, email, studentId],
  );

  const submit = useCallback(() => {
    if (!canSubmit || loading) return;
    void doRegister(false);
  }, [canSubmit, loading, doRegister]);

  const confirmMove = useCallback(() => {
    void doRegister(true);
  }, [doRegister]);

  const resendCode = useCallback(() => {
    void doRegister(false);
  }, [doRegister]);

  const submitOtp = useCallback(async () => {
    if (otpCode.length !== 6 || loading) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyOtp({ whatsapp_number: whatsappNumber, otp_code: otpCode });
      setScreen("success");
    } catch (err) {
      setError(friendlyError(err, "otp"));
    } finally {
      setLoading(false);
    }
  }, [otpCode, whatsappNumber, loading]);

  const backToForm = useCallback(() => {
    setScreen("form");
    setError(null);
  }, []);

  return {
    screen,
    phone,
    setPhone,
    phoneLocked,
    fullName,
    setFullName,
    email,
    setEmail,
    studentId,
    setStudentId,
    consent,
    setConsent,
    canSubmit,
    submit,
    otpCode,
    setOtpCode,
    submitOtp,
    resendCode,
    expiresInMinutes,
    debugOtpCode,
    existingNumberMasked,
    confirmMove,
    backToForm,
    loading,
    error,
    maskedPhone,
    whatsappLink: WHATSAPP_BOT_LINK,
  };
}
