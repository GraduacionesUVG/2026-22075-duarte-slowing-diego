const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"];

type KeypadProps = {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
};

export default function Keypad({ onDigit, onClear, onBackspace }: KeypadProps) {
  return (
    <div className="flex w-[324px] flex-wrap gap-3">
      {KEYS.map((key) => {
        const isAction = key === "C" || key === "←";
        return (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "C") onClear();
              else if (key === "←") onBackspace();
              else onDigit(key);
            }}
            className={`kds-ring-border flex h-16 w-[100px] items-center short:h-14 justify-center rounded-lg text-lg font-semibold ${
              isAction
                ? "bg-gray-100 text-gray-500 "
                : "bg-white text-gray-900 "
            }`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
