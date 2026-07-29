export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="serviceit-logo-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#serviceit-logo-gradient)" fillOpacity="0.15" />
      <path
        d="M27.5 11.5c-1.6-1.2-3.6-1.8-5.7-1.6-4 .4-7.1 3.7-7.1 7.6 0 2 .9 3.9 2.4 5.2"
        stroke="url(#serviceit-logo-gradient)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12.5 28.5c1.6 1.2 3.6 1.8 5.7 1.6 4-.4 7.1-3.7 7.1-7.6 0-2-.9-3.9-2.4-5.2"
        stroke="url(#serviceit-logo-gradient)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="12" r="1.4" fill="#5EEAD4" />
      <circle cx="9" cy="16" r="1" fill="#5EEAD4" fillOpacity="0.7" />
      <circle cx="28" cy="28" r="1.4" fill="#5EEAD4" />
      <circle cx="31" cy="24" r="1" fill="#5EEAD4" fillOpacity="0.7" />
    </svg>
  );
}
