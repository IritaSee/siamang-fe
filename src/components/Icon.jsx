// Small hand-drawn line-icon set (feather-style, 24x24, stroke-based) so the
// app has consistent iconography without pulling in an icon library.
const PATHS = {
  grid: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  map: "M4 6.5 9 4l6 2.5L20 4v13.5L15 20l-6-2.5L4 20V6.5z M9 4v13.5 M15 6.5V20",
  bell: "M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z M9.5 19a2.5 2.5 0 0 0 5 0",
  cpu: "M8 3v3M16 3v3M8 18v3M16 18v3M3 8h3M3 16h3M18 8h3M18 16h3 M7 7h10v10H7V7z M10 10h4v4h-4v-4z",
  users: "M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c0-3.5 2.8-6 5.5-6s5.5 2.5 5.5 6 M16.5 5a3 3 0 0 1 0 6 M15.5 14c2.5.2 5 2.2 5 6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  "chevron-right": "M9 5l7 7-7 7",
  "chevron-left": "M15 5l-7 7 7 7",
  "chevron-down": "M5 9l7 7 7-7",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.4 2.6a7.6 7.6 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.4-2.6a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5z",
  home: "M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5z",
  siren: "M7 14a5 5 0 0 1 10 0v4H7v-4z M12 5V3 M6.5 7.5l-1.4-1.4 M17.5 7.5l1.4-1.4 M4 20h16",
  battery: "M3 8h14v8H3V8z M17 10.5h2v3h-2 M6 10.5v3M9 10.5v3",
  "wifi-off": "M3 3l18 18 M5 8.8a15 15 0 0 1 4-2.2 M9.5 5.6a15 15 0 0 1 9.5 3.2 M8 12.3a9 9 0 0 1 3.5-1.9 M12.5 10.6a9 9 0 0 1 3.7 1.7 M12 16.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
  plus: "M12 5v14M5 12h14",
  "arrow-left": "M19 12H5 M11 18l-6-6 6-6",
  "arrow-right": "M5 12h14 M13 6l6 6-6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  x: "M18 6 6 18M6 6l12 12",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3.5 2",
  filter: "M4 5h16l-6 8v6l-4-2v-4L4 5z",
  droplet: "M12 3s7 7.5 7 12.5A7 7 0 0 1 5 15.5C5 10.5 12 3 12 3z",
  layers: "M12 3 3 8l9 5 9-5-9-5z M3 13l9 5 9-5 M3 8v0",
  check: "M20 6 9 17l-5-5",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v6 M12 7.5v.01",
  building: "M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16 M13 21V9h5a1 1 0 0 1 1 1v11 M8 7h1M8 10h1M8 13h1M3 21h18",
};

export default function Icon({ name, size = 18, strokeWidth = 2, className = "" }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
