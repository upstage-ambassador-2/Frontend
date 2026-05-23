import type { CSSProperties, ReactNode } from "react";

type IconProps = {
  size?: number;
  style?: CSSProperties;
};

const Icon = ({
  children,
  size = 16,
  style,
}: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", ...style }}
    aria-hidden
  >
    {children}
  </svg>
);

export const IconCompose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 13.5h11" />
    <path d="M10 3.5l2.5 2.5-6 6H4v-2.5l6-6z" />
  </Icon>
);

export const IconPeople = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="11.2" cy="6.6" r="1.9" />
    <path d="M2 13c.4-1.8 2-3 4-3s3.6 1.2 4 3" />
    <path d="M10 13c.3-1.3 1.4-2.2 2.7-2.2 1.4 0 2.5.9 2.8 2.2" />
  </Icon>
);

export const IconHistory = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8a5 5 0 1 0 1.5-3.5L3 6" />
    <path d="M3 3v3h3" />
    <path d="M8 5.5V8l1.8 1.2" />
  </Icon>
);

export const IconFormat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3.5h10" />
    <path d="M3 6.5h7" />
    <path d="M3 9.5h10" />
    <path d="M3 12.5h6" />
  </Icon>
);

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7L3.6 3.6" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="7" cy="7" r="4.2" />
    <path d="M10.2 10.2l3 3" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3v10M3 8h10" />
  </Icon>
);

export const IconChevron = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 3.5L10 8l-4.5 4.5" />
  </Icon>
);

export const IconSparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 2.5l1.3 3.2L12.5 7l-3.2 1.3L8 11.5 6.7 8.3 3.5 7l3.2-1.3L8 2.5z" />
    <path d="M13 11.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2z" />
  </Icon>
);

export const IconCopy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="5" width="8" height="8" rx="1.6" />
    <path d="M3.5 10V4a1 1 0 0 1 1-1H10" />
  </Icon>
);

export const IconRefresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 7A5.5 5.5 0 0 0 4 4.5L2.5 6M2.5 3v3h3" />
    <path d="M2.5 9A5.5 5.5 0 0 0 12 11.5L13.5 10M13.5 13v-3h-3" />
  </Icon>
);

export const IconSend = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 2.5L7 9" />
    <path d="M13.5 2.5L9 14l-2-5-5-2 11.5-4.5z" />
  </Icon>
);

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 2.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L8 11.2l-3.4 1.8.7-3.8-2.8-2.7 3.8-.5L8 2.5z" />
  </Icon>
);

export const IconMore = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 4.5h10" />
    <path d="M3 8h10" />
    <path d="M3 11.5h10" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8.5l3 3 7-7" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 4l8 8" />
    <path d="M12 4l-8 8" />
  </Icon>
);

export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
    <path d="M2.5 4.5L8 9l5.5-4.5" />
  </Icon>
);

export const IconChat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 7c0-2.2 2.5-4 5.5-4s5.5 1.8 5.5 4-2.5 4-5.5 4c-.7 0-1.4-.1-2-.3L3 12l.6-2.1A3.6 3.6 0 0 1 2.5 7z" />
  </Icon>
);
