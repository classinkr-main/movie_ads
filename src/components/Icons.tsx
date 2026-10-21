import React from "react";

// 시스템 흐름도의 역 아이콘 — 단색 라인 아이콘(24 그리드)
type IconProps = { size?: number; color?: string; stroke?: number };
const Base: React.FC<IconProps & { children: React.ReactNode }> = ({ size = 40, color = "#fff", stroke = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconFile: React.FC<IconProps> = (p) => (
  <Base {...p}>
    <path d="M6 2.5h8l4.5 4.5V21a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" />
    <path d="M14 2.5V7h4.5M8.5 12h7M8.5 15.5h7M8.5 19h4" />
  </Base>
);

export const IconBoard: React.FC<IconProps> = (p) => (
  <Base {...p}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="1" />
    <path d="M8 20.5h8M12 16.5v4M6 12.5l3-3 2.5 2 4-4.5 2.5 2.5" />
  </Base>
);

export const IconRec: React.FC<IconProps> = (p) => (
  <Base {...p}>
    <rect x="2.5" y="6" width="13.5" height="12" rx="2" />
    <path d="M16 10.5l5.5-3v9l-5.5-3" />
    <circle cx="7" cy="10.5" r="1.4" fill={p.color ?? "#fff"} stroke="none" />
  </Base>
);

export const IconPhone: React.FC<IconProps> = (p) => (
  <Base {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M10.5 9.5v5l4-2.5-4-2.5ZM10.5 18.5h3" />
  </Base>
);

export const IconChart: React.FC<IconProps> = (p) => (
  <Base {...p}>
    <path d="M3.5 20.5h17M6.5 17v-5M11 17V8M15.5 17v-7M20 17V5" />
  </Base>
);
