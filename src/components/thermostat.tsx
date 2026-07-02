import { useEffect, useMemo, useState } from "react";
import { Snowflake, Flame, RotateCcw } from "lucide-react";

const MIN = 0;
const MAX = 100;

function zoneFor(value: number): "cold" | "normal" | "hot" {
  if (value <= 40) return "cold";
  if (value >= 61) return "hot";
  return "normal";
}

function tempLabel(value: number) {
  const c = Math.round(-10 + (value / 100) * 55);
  return `${c}°`;
}

// Precomputed random particles (stable across renders)
function useParticles(count: number, seed: number) {
  return useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      delay: rand() * 8,
      duration: 6 + rand() * 10,
      size: 0.6 + rand() * 1.6,
      drift: (rand() - 0.5) * 40,
      opacity: 0.4 + rand() * 0.6,
    }));
  }, [count, seed]);
}

export function Thermostat() {
  const [value, setValue] = useState(50);
  const zone = zoneFor(value);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("site-cold", "site-normal", "site-hot");
    body.classList.add(`site-${zone}`);
    return () => {
      body.classList.remove("site-cold", "site-normal", "site-hot");
    };
  }, [zone]);

  const snow = useParticles(40, 42);
  const embers = useParticles(28, 91);

  const zoneColor =
    zone === "cold" ? "text-sky-400" : zone === "hot" ? "text-orange-400" : "text-slate-400";

  return (
    <>
      {/* Frost vignette / ice edges */}
      <div className="thermo-frost pointer-events-none fixed inset-0 z-[59]" aria-hidden />

      {/* Heat vignette */}
      <div className="thermo-heat pointer-events-none fixed inset-0 z-[59]" aria-hidden />

      {/* Snow particles */}
      {zone === "cold" && (
        <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
          {snow.map((p, i) => (
            <span
              key={i}
              className="thermo-snow"
              style={{
                left: `${p.left}%`,
                animationDelay: `-${p.delay}s`,
                animationDuration: `${p.duration}s`,
                width: `${p.size * 4}px`,
                height: `${p.size * 4}px`,
                opacity: p.opacity,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--drift" as any]: `${p.drift}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Embers */}
      {zone === "hot" && (
        <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
          {embers.map((p, i) => (
            <span
              key={i}
              className="thermo-ember"
              style={{
                left: `${p.left}%`,
                animationDelay: `-${p.delay}s`,
                animationDuration: `${p.duration + 2}s`,
                width: `${p.size * 3}px`,
                height: `${p.size * 3}px`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Compact thermometer — always visible */}
      <div
        className="fixed right-2 top-1/2 z-[70] -translate-y-1/2 flex flex-col items-center gap-1.5 rounded-full bg-background/85 px-1.5 py-2 shadow-card ring-1 ring-border backdrop-blur sm:right-3"
        role="group"
        aria-label="Site thermostat"
      >
        <Flame
          className={`h-3 w-3 ${zone === "hot" ? "text-orange-500" : "text-muted-foreground/40"}`}
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="thermo-slider"
          aria-label="Temperature"
        />

        <Snowflake
          className={`h-3 w-3 ${zone === "cold" ? "text-sky-500" : "text-muted-foreground/40"}`}
        />

        <span className={`text-[10px] font-semibold tabular-nums ${zoneColor}`}>
          {tempLabel(value)}
        </span>

        <button
          onClick={() => setValue(50)}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Reset to normal"
          title="Reset"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    </>
  );
}
