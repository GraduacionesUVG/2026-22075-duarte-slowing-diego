import type { Meta, StoryObj } from "@storybook/react-vite";
import RegisterForm from "../../views/RegisterForm";
import ConfirmEmailSent from "../../views/ConfirmEmailSent";
import RegisterSuccess from "../../views/RegisterSuccess";
import AlreadyRegistered from "../../views/AlreadyRegistered";
import type { useRegistrationFlow } from "../../hooks/useRegistrationFlow";

type Flow = ReturnType<typeof useRegistrationFlow>;

// El estado vive dentro del hook, así que cada pantalla recibe un `flow` fijo (sin backend).
// Para probar la secuencia real usa "Flujos / Registro completo".
const noop = () => {};
const noopAsync = async () => {};
const flow = (over: Partial<Flow> = {}): Flow => ({
  screen: "form",
  phone: "55551234",
  setPhone: noop,
  phoneLocked: false,
  fullName: "Ana Gómez",
  setFullName: noop,
  email: "ana.gomez@universidad.edu",
  setEmail: noop,
  studentId: "20240123",
  setStudentId: noop,
  consent: true,
  setConsent: noop,
  canSubmit: true,
  submit: noop,
  otpCode: "",
  setOtpCode: noop,
  submitOtp: noopAsync,
  resendCode: noop,
  expiresInMinutes: 10,
  debugOtpCode: "123456",
  existingNumberMasked: "XXXXXXXX1234",
  confirmMove: noop,
  backToForm: noop,
  loading: false,
  error: null,
  maskedPhone: "XXXXXXXX1234",
  whatsappLink: "https://wa.me/50280133587",
  ...over,
});

const meta = {
  title: "Register/Pantallas",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormEmpty: Story = {
  name: "Formulario vacío",
  render: () => <RegisterForm flow={flow({ phone: "", fullName: "", email: "", studentId: "", consent: false, canSubmit: false })} />,
};
export const FormFilled: Story = { name: "Formulario completo", render: () => <RegisterForm flow={flow()} /> };
export const FormPhoneFromBot: Story = {
  name: "Formulario con número precargado (viene del bot)",
  render: () => <RegisterForm flow={flow({ phoneLocked: true })} />,
};
export const FormError: Story = {
  name: "Formulario con error",
  render: () => <RegisterForm flow={flow({ error: "No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo en unos segundos." })} />,
};
export const FormLoading: Story = { name: "Formulario enviando", render: () => <RegisterForm flow={flow({ loading: true })} /> };

export const OtpPending: Story = { name: "Código OTP", render: () => <ConfirmEmailSent flow={flow({ screen: "otp" })} /> };
export const OtpFilled: Story = {
  name: "Código OTP completo",
  render: () => <ConfirmEmailSent flow={flow({ screen: "otp", otpCode: "123456" })} />,
};
export const OtpError: Story = {
  name: "Código OTP incorrecto",
  render: () => <ConfirmEmailSent flow={flow({ screen: "otp", otpCode: "000000", error: "El código es incorrecto o ya venció. Revisa los 6 dígitos o pide uno nuevo con «Reenviar código»." })} />,
};

export const Success: Story = { name: "Registro exitoso", render: () => <RegisterSuccess flow={flow({ screen: "success" })} /> };

export const Conflict: Story = {
  name: "Correo ya vinculado",
  render: () => <AlreadyRegistered flow={flow({ screen: "conflict" })} />,
};
