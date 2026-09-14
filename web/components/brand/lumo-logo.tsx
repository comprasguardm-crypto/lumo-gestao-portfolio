import { cn } from "@/lib/utils";

type LumoLogoMarkProps = {
  className?: string;
  framed?: boolean;
};

export function LumoLogoMark({ className, framed = true }: LumoLogoMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        framed && "rounded-[28%] bg-lumo-ink-deep shadow-[inset_0_0_28px_rgba(32,227,162,0.14)]",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lumo-mark-gradient" x1="26" y1="18" x2="76" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--lumo-lime)" />
            <stop offset="0.48" stopColor="var(--lumo-mint)" />
            <stop offset="1" stopColor="var(--lumo-turquoise)" />
          </linearGradient>
        </defs>
        <path
          d="M30 20C30 14.4772 34.4772 10 40 10H46C51.5228 10 56 14.4772 56 20V60C56 69.9411 64.0589 78 74 78H78C82.4183 78 86 81.5817 86 86H56C41.6406 86 30 74.3594 30 60V20Z"
          fill="url(#lumo-mark-gradient)"
        />
        <path
          d="M56 57H68C77.9411 57 86 65.0589 86 75V78H74C64.0589 78 56 69.9411 56 60V57Z"
          fill="var(--lumo-turquoise)"
          fillOpacity="0.78"
        />
      </svg>
    </span>
  );
}

type LumoBrandProps = {
  className?: string;
  compact?: boolean;
  dark?: boolean;
};

export function LumoBrand({ className, compact = false, dark = false }: LumoBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LumoLogoMark className={compact ? "h-8 w-8" : "h-11 w-11"} />
      <div className="min-w-0">
        <div className={cn("font-display font-semibold leading-none", compact ? "text-[15px]" : "text-xl", dark ? "text-white" : "text-lumo-ink")}>
          Lumo <span className="text-lumo-turquoise">GestÃ£o</span>
        </div>
        {!compact && (
          <p className={cn("mt-1 text-xs", dark ? "text-slate-400" : "text-lumo-slate")}>
            GestÃ£o de RH <span className="text-lumo-turquoise">descomplicada.</span>
          </p>
        )}
      </div>
    </div>
  );
}
