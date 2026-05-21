// Stroke-based inline SVG icons. Keep size 16 default; pass {size} to override.
const Icon = ({ d, size = 16, fill = "none", stroke = "currentColor", sw = 1.6, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  Home:    (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 9v12h14V9" /></Icon>,
  Card:    (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></Icon>,
  Chart:   (p) => <Icon {...p}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20H2" /></Icon>,
  Inbox:   (p) => <Icon {...p}><path d="M3 13l3-8h12l3 8" /><path d="M3 13v6h18v-6" /><path d="M8 13a4 4 0 008 0" /></Icon>,
  Wallet:  (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 13h2" /><path d="M3 10h18" /></Icon>,
  Settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></Icon>,
  Plus:    (p) => <Icon {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>,
  Check:   (p) => <Icon {...p}><path d="M5 12l5 5L20 6" /></Icon>,
  Eye:     (p) => <Icon {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></Icon>,
  Mail:    (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Icon>,
  Phone:   (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.93.34 1.84.65 2.71a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.37-1.37a2 2 0 012.11-.45c.87.31 1.78.53 2.71.65A2 2 0 0122 16.92z" /></Icon>,
  Globe:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13 13 0 010 18" /><path d="M12 3a13 13 0 000 18" /></Icon>,
  Map:     (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></Icon>,
  Calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></Icon>,
  Linkedin:(p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v8" /><circle cx="8" cy="7" r="0.6" fill="currentColor" /><path d="M12 18v-5a2.5 2.5 0 015 0v5" /><path d="M12 10v8" /></Icon>,
  Upload:  (p) => <Icon {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></Icon>,
  Image:   (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.6" /><path d="M21 16l-5-5-9 9" /></Icon>,
  Video:   (p) => <Icon {...p}><rect x="3" y="5" width="14" height="14" rx="2" /><path d="M17 9l5-3v12l-5-3z" /></Icon>,
  Palette: (p) => <Icon {...p}><path d="M12 22a10 10 0 1110-10c0 3-3 4-5 4h-2a2 2 0 00-2 2v1a2 2 0 01-3 3z" /><circle cx="7.5" cy="10.5" r="1" fill="currentColor" /><circle cx="12" cy="7" r="1" fill="currentColor" /><circle cx="16.5" cy="10.5" r="1" fill="currentColor" /></Icon>,
  Share:   (p) => <Icon {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></Icon>,
  Qr:      (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z M20 14h1 M14 20h1 M17 17h4v4" /></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Icon>,
  Arrow:   (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>,
  ArrowL:  (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>,
  Dot3:    (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></Icon>,
  Download:(p) => <Icon {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></Icon>,
  Copy:    (p) => <Icon {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></Icon>,
  Trash:   (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></Icon>,
  Pencil:  (p) => <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></Icon>,
  Lock:    (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></Icon>,
  Star:    (p) => <Icon {...p}><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z" /></Icon>,
  Time:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  Tap:     (p) => <Icon {...p}><path d="M9 11V6a3 3 0 016 0v5" /><path d="M9 11l-3 1 4 9h8l1-7-7-3" /></Icon>,
};

window.Icons = Icons;
