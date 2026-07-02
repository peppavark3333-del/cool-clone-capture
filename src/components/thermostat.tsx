import { useEffect, useState } from "react";
import { Snowflake, Flame, RotateCcw, Thermometer } from "lucide-react";

const MIN = 0;
const MAX = 100;

function zoneFor(value: number): "cold" | "normal" | "hot" {
  if (value <= 40) return "cold";
  if (value >= 61) return "hot";
  return "normal";
}

function tempLabel(value: number) {
  // Map 0..100 -> -10°C .. 45°C for display flair
  const c = Math.round(-10 + (value / 100) * 55);
  return `${c}°C`;
}

export function Thermostat() {
  const [value, setValue] = useState(50);
  const [open, setOpen] = useState(true);
  const zone = zoneFor(value);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("site-cold", "site-normal", "site-hot");
    body.classList.add(`site-${zone}`);
    return () => {
      body.classList.remove("site-cold", "site-normal", "site-hot");
    };
  }, [zone]);

  const zoneColor =
    zone === "cold"
      ? "text-sky-400"
      : zone === "hot"
        ? "text-orange-400"
        : "text-muted-foreground";

  const zoneLabel = zone === "cold" ? "Cold" : zone === "hot" ? "Hot" : "Normal";

  return (
    <>
      {/* Overlay effects */}
      <div className="thermo-overlay pointer-events-none fixed inset-0 z-[60]" aria-hidden />

      {/* Toggle button (mobile-friendly) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-3 top-1/2 z-[70] -translate-y-1/2 rounded-full bg-background/90 p-3 shadow-card ring-1 ring-border backdrop-blur hover:bg-background"
          aria-label="Open thermostat"
        >
          <Thermometer className={`h-5 w-5 ${zoneColor}`} />
        </button>
      )}

      {open && (
        <div
          className="fixed right-3 top-1/2 z-[70] -translate-y-1/2 flex flex-col items-center gap-3 rounded-2xl bg-background/90 p-3 shadow-card ring-1 ring-border backdrop-blur sm:right-4"
          role="group"
          aria-label="Site thermostat"
        >
          <div className="flex flex-col items-center">
            <Flame className={`h-4 w-4 ${zone === "hot" ? "text-orange-500" : "text-muted-foreground/50"}`} />
            <span className={`mt-1 text-xs font-semibold ${zoneColor}`}>{tempLabel(value)}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{zoneLabel}</span>
          </div>

          {/* Vertical slider */}
          <input
            type="range"
            min={MIN}
            max={MAX}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="thermo-slider"
            aria-label="Temperature"
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={value}
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--fill" as any]: `${value}%`,
            }}
          />

          <Snowflake className={`h-4 w-4 ${zone === "cold" ? "text-sky-500" : "text-muted-foreground/50"}`} />

          <button
            onClick={() => setValue(50)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Reset to normal"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setOpen(false)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
            aria-label="Hide thermostat"
          >
            hide
          </button>
        </div>
      )}
    </>
  );
}
