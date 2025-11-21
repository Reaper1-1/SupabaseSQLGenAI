import { Platform } from "react-native";

const primaryColorLight = "#1A365D";
const primaryColorDark = "#2A4A7D";
const secondaryColor = "#D4A574";
const accentColor = "#4A9B9B";

export const Colors = {
  light: {
    text: "#2D3748",
    textSecondary: "#718096",
    buttonText: "#FFFFFF",
    tabIconDefault: "#718096",
    tabIconSelected: primaryColorLight,
    link: primaryColorLight,
    primary: primaryColorLight,
    secondary: secondaryColor,
    accent: accentColor,
    success: "#6B8E23",
    warning: "#F59E0B",
    error: "#DC2626",
    backgroundRoot: "#F7F7F7", // Elevation 0
    backgroundDefault: "#FFFFFF", // Elevation 1
    backgroundSecondary: "#E8E8E8", // Elevation 2
    backgroundTertiary: "#D9D9D9", // Elevation 3
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: accentColor,
    link: accentColor,
    primary: primaryColorDark,
    secondary: secondaryColor,
    accent: accentColor,
    success: "#8BAF3C",
    warning: "#F59E0B",
    error: "#EF4444",
    backgroundRoot: "#1F1F1F", // Elevation 0
    backgroundDefault: "#2A2C2E", // Elevation 1
    backgroundSecondary: "#353739", // Elevation 2
    backgroundTertiary: "#404244", // Elevation 3
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
