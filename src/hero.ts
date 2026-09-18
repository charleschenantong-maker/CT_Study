import { heroui } from "@heroui/react";

// HeroUI v2 + Tailwind v4: CSS-first setup, referenced from index.css via `@plugin`.
// iOS tuning: slightly larger radii, light theme by default.
export default heroui({
  defaultTheme: "light",
  layout: {
    radius: {
      small: "8px",
      medium: "12px",
      large: "16px",
    },
    borderWidth: {
      small: "1px",
      medium: "1px",
      large: "2px",
    },
  },
});
