import { reply, type MockRoute } from "@repo/config/storybook/mockApi";

export const DEMO_OTP = "123456";
// Un correo que contenga "existente" simula un correo ya vinculado a otro número (409).
export const CONFLICT_EMAIL = "existente@universidad.edu";

// Backend en memoria del registro de estudiantes (WhatsApp + OTP por correo).
export function registerBackend(): MockRoute[] {
  return [
    {
      method: "POST",
      path: "/auth/register",
      respond: ({ body }) => {
        if (String(body.email).includes("existente") && !body.confirm_replace) {
          return reply(409, {
            detail: {
              message: "Este correo ya está vinculado a otro número",
              existing_number_masked: "XXXXXXXX1234",
              hint: "Si continúas, se reemplazará el número anterior.",
            },
          });
        }
        return { status: "sent", detail: "Código enviado", expires_in_minutes: 10, debug_otp_code: DEMO_OTP };
      },
    },
    {
      method: "POST",
      path: "/auth/verify-otp",
      respond: ({ body }) =>
        body.otp_code === DEMO_OTP
          ? { status: "verified", message: "Número verificado" }
          : reply(400, { detail: "El código es incorrecto o venció" }),
    },
  ];
}
