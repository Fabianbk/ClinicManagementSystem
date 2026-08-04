import type { SVGProps } from "react";

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14c0-6 4-10 10-10 3 6 1 12-5 14-3 1-5-1-5-4Z" />
      <path d="M6 18c2-3 5-6 8-9" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.5 3.5c1 0 2.7 2.3 2.7 3.4 0 1-1.4 1.8-1.4 2.6 0 1.7 3.2 4.9 4.9 4.9.8 0 1.6-1.4 2.6-1.4 1.1 0 3.4 1.7 3.4 2.7 0 1.6-1.7 3.3-3.3 3.3-4.4 0-11.2-6.8-11.2-11.2 0-1.6 1.7-3.3 3.3-3.3Z" />
    </svg>
  );
}

export function BadgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5 19 7v5c0 4.4-2.9 7.5-7 8.5-4.1-1-7-4.1-7-8.5V7l7-3.5Z" />
      <path d="M9.2 12.2l1.9 1.9 3.7-3.9" />
    </svg>
  );
}

export function MortarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12c0 4 3 7.5 7 7.5s7-3.5 7-7.5" />
      <path d="M4.2 12h15.6" />
      <path d="M12 3.5c2 1.3 3 3 3 5" />
    </svg>
  );
}

export function HandsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 13c1.5-2.5 4-4 8-4s6.5 1.5 8 4" />
      <path d="M4 13c0 3.5 3.5 6.5 8 6.5s8-3 8-6.5" />
    </svg>
  );
}

export function LeafPattern(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className="leaf-pattern" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <pattern id="leafPattern" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <path
            d="M10 45c0-14 9-23 23-23 6 13 2 27-11 31-7 2-12-2-12-8Z"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#leafPattern)" />
    </svg>
  );
}