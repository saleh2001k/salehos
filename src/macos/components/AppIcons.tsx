interface IconProps {
  className?: string;
}

/** Apple logo (user-supplied artwork), inherits currentColor. */
export function AppleLogo({ size = 16, className = "" }: IconProps & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
    </svg>
  );
}

/** Real macOS .icns artwork, converted to PNG in /public/icons. */
function AppIcon({ src, alt, className = "" }: IconProps & { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`h-full w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] ${className}`}
    />
  );
}

export function FinderIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/finder.png" alt="Finder" className={className} />;
}

export function SafariIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/safari.png" alt="Safari" className={className} />;
}

export function TerminalIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/terminal.png" alt="Terminal" className={className} />;
}

export function MailIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/mail.png" alt="Mail" className={className} />;
}

export function PhoneIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/phone.png" alt="Phone" className={className} />;
}

export function ContactsIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/contacts.png" alt="Contacts" className={className} />;
}

export function SettingsIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/settings.png" alt="Settings" className={className} />;
}

export function PreviewIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/preview.png" alt="Preview" className={className} />;
}

export function LaunchpadIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/games.png" alt="Launchpad" className={className} />;
}

export function ArcadeIcon({ className = "" }: IconProps) {
  // This artwork is full-bleed; the other .icns exports keep Apple's ~82% grid,
  // so pad it down to match their visual size.
  return <AppIcon src="/icons/arcade.png" alt="Arcade" className={`p-[9%] ${className}`} />;
}

export function GithubIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/github.png" alt="GitHub" className={className} />;
}

export function LinkedinIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/linkedin.png" alt="LinkedIn" className={className} />;
}

export function XIcon({ className = "" }: IconProps) {
  return <AppIcon src="/icons/x.png" alt="X" className={className} />;
}

export function FolderGlyph({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 64 52" className={className}>
      <defs>
        <linearGradient id="folder-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc1f7" />
          <stop offset="1" stopColor="#52a7ef" />
        </linearGradient>
        <linearGradient id="folder-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#66b5f4" />
          <stop offset="1" stopColor="#2f8be2" />
        </linearGradient>
      </defs>
      <path
        d="M4 8a4 4 0 0 1 4-4h15.5a4 4 0 0 1 2.9 1.2L30 9h26a4 4 0 0 1 4 4v3H4V8z"
        fill="url(#folder-top)"
      />
      <rect x="4" y="12" width="56" height="36" rx="4" fill="url(#folder-body)" />
    </svg>
  );
}

export function PdfGlyph({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 52 64" className={className}>
      <path
        d="M4 6a4 4 0 0 1 4-4h26l14 14v42a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z"
        fill="#f4f4f2"
      />
      <path d="M34 2l14 14H38a4 4 0 0 1-4-4V2z" fill="#d8d8d4" />
      <rect x="10" y="36" width="32" height="14" rx="3" fill="#d23c3c" />
      <text
        x="26"
        y="46.5"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="9.5"
        fill="#ffffff"
      >
        PDF
      </text>
    </svg>
  );
}

export function TextFileGlyph({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 52 64" className={className}>
      <path
        d="M4 6a4 4 0 0 1 4-4h26l14 14v42a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z"
        fill="#f4f4f2"
      />
      <path d="M34 2l14 14H38a4 4 0 0 1-4-4V2z" fill="#d8d8d4" />
      <rect x="11" y="26" width="30" height="2.5" rx="1.25" fill="#9a9a94" />
      <rect x="11" y="33" width="30" height="2.5" rx="1.25" fill="#9a9a94" />
      <rect x="11" y="40" width="30" height="2.5" rx="1.25" fill="#9a9a94" />
      <rect x="11" y="47" width="18" height="2.5" rx="1.25" fill="#9a9a94" />
    </svg>
  );
}
