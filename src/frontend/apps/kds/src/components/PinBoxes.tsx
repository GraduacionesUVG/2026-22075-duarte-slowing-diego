type PinBoxesProps = {
  length: number;
  value: string;
  error?: boolean;
};

export default function PinBoxes({ length, value, error }: PinBoxesProps) {
  return (
    <div className="flex flex-row gap-4">
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const active = i === value.length;
        return (
          <div
            key={i}
            className={`kds-ring-border flex h-[88px] w-[76px] items-center short:h-[72px] justify-center rounded-lg bg-white ${
              error ? "ring-2 ring-inset ring-red-600" : active ? "ring-2 ring-inset ring-kds-brand" : ""
            }`}
          >
            {filled && <div className="h-4 w-4 rounded-full bg-gray-900" />}
          </div>
        );
      })}
    </div>
  );
}
