import { RISK_LEVELS } from "../theme/riskLevels";

// Each status gets its own silhouette, not just a color swatch, so the system
// still reads correctly for color-blind users and in grayscale printouts.
// `black` / no-signal is deliberately NOT a filled shape like the others —
// it's a hollow, slashed glyph so it never gets misread as "a fifth severity".
export default function RiskIcon({ level, size = 16, title }) {
  const def = RISK_LEVELS[level];
  const color = def ? def.color : "var(--ink-500)";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    role: title ? "img" : "presentation",
    "aria-label": title,
  };

  switch (level) {
    case "green":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <circle cx="12" cy="12" r="9" fill={color} />
        </svg>
      );
    case "yellow":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path d="M12 3.5 21.5 20h-19L12 3.5z" fill={color} />
        </svg>
      );
    case "orange":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 2.5 22 20.5H2L12 2.5z"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "red":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <rect
            x="5.2"
            y="5.2"
            width="13.6"
            height="13.6"
            rx="2"
            fill={color}
            transform="rotate(45 12 12)"
          />
        </svg>
      );
    case "black":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2.5 2.5" />
          <path d="M7.5 7.5 16.5 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 12a7 7 0 0 1 7-7" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="var(--ink-300)" />
        </svg>
      );
  }
}
