import RegisterForm from "./views/RegisterForm";
import ConfirmEmailSent from "./views/ConfirmEmailSent";
import RegisterSuccess from "./views/RegisterSuccess";
import AlreadyRegistered from "./views/AlreadyRegistered";
import { useRegistrationFlow } from "./hooks/useRegistrationFlow";

export default function App() {
  const flow = useRegistrationFlow();

  switch (flow.screen) {
    case "otp":
      return <ConfirmEmailSent flow={flow} />;
    case "success":
      return <RegisterSuccess flow={flow} />;
    case "conflict":
      return <AlreadyRegistered flow={flow} />;
    default:
      return <RegisterForm flow={flow} />;
  }
}
