import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { playOrderSound } from "../../lib/sounds";
import { orderSpeechText, pickVoice, speak, speechSupported } from "../../lib/speech";
import { StageIcon, SpeakerIcon, SoundIcon } from "../../components/ActionIcons";
import SpeakButton from "../../components/SpeakButton";
import { ordersFixture } from "../fixtures";

const order = {
  ...ordersFixture[0]!,
  items: [
    { id: "d1", menuItemId: "m1", name: "Hamburguesa clásica", quantity: 2, modifiers: ["Tocino", "Queso extra"], note: "sin cebolla, por favor" },
    { id: "d2", menuItemId: "m4", name: "Papas fritas", quantity: 1 },
  ],
};

const buttonClass = "rounded-[20px] bg-kds-brand px-5 py-3 text-lg font-semibold text-white";

// Qué voz usará el KDS: la mejor en español y, si el equipo no tiene ninguna, la que haya.
function VoiceStatus() {
  const [status, setStatus] = useState<string>("Buscando voces…");
  useEffect(() => {
    void pickVoice().then(({ voice, spanish }) =>
      setStatus(
        spanish && voice
          ? `Voz en español: ${voice.name} (${voice.lang})`
          : voice
            ? `Este equipo no tiene voz en español: se leerá con ${voice.name} (${voice.lang}).`
            : "Este equipo no tiene ninguna voz instalada: no se puede leer el pedido.",
      ),
    );
  }, []);
  const found = status.startsWith("Voz en español");
  return <p className={`text-sm font-semibold ${found ? "text-green-700" : "text-red-600"}`}>{status}</p>;
}

function AudioDemo() {
  const text = orderSpeechText(order);
  return (
    <div className="flex max-w-xl flex-col gap-6 p-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sonidos de aviso</h2>
        <p className="text-sm text-gray-500">Suenan al caer un pedido nuevo. Cada tipo tiene su propio sonido.</p>
        <div className="flex flex-row gap-3">
          <button type="button" className={buttonClass} onClick={() => playOrderSound("acceptance")}>
            Aceptación (ding-dong)
          </button>
          <button type="button" className={buttonClass} onClick={() => playOrderSound("delivery")}>
            Entrega (3 notas)
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Texto a voz</h2>
        <p className="text-sm text-gray-500">
          Se lee solo lo del menú (cantidad, producto y modificadores). No se leen el número de pedido,
          el carné ni la nota libre del cliente ("sin cebolla, por favor").
        </p>
        <p className="rounded-lg bg-gray-100 p-3 text-sm font-medium">{text}</p>
        <VoiceStatus />
        <div className="flex flex-row items-center gap-3">
          <SpeakButton text={text} className="text-black" />
          <button type="button" className={buttonClass} onClick={() => void speak(text)}>
            Leer en voz alta
          </button>
          {!speechSupported && <span className="text-sm text-red-600">Este navegador no soporta voz.</span>}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Íconos</h2>
        <div className="flex flex-row items-center gap-6 text-black">
          <span className="flex items-center gap-2"><StageIcon name="prepare" /> Preparación</span>
          <span className="flex items-center gap-2"><StageIcon name="ready" /> Listo</span>
          <span className="flex items-center gap-2"><StageIcon name="deliver" /> Entrega</span>
          <SpeakerIcon />
          <SoundIcon on />
          <SoundIcon on={false} />
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "KDS/Sonidos y voz",
  parameters: { layout: "fullscreen" },
  render: () => <AudioDemo />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Probar: Story = { name: "Probar sonidos, voz e íconos" };
