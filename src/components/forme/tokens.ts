export const tokens = {
  bg: "#F7F4FF",
  card: "#FFFFFF",
  primary: "#8B5CF6",
  secondary: "#C8B6FF",
  success: "#10B981",
  warning: "#D97706",
  text: "#1E1E2E",
  muted: "#6B7280",
  border: "#EEEAF6",
  surface: "#F8F5FF",
} as const;

export type Tokens = typeof tokens;