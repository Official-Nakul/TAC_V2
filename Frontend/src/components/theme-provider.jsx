"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

const ThemeContext = React.createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Try to get the theme from localStorage
      const storedTheme = window.localStorage.getItem("theme");
      // Return the stored theme if it exists, otherwise default to "light"
      return storedTheme || "light";
    }
    // Default to light theme if not in browser
    return "light";
  });

  // Update the data-theme attribute on the document element when the theme changes
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md p-2 hover:bg-muted transition-colors"
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">
        Switch to {theme === "light" ? "dark" : "light"} theme
      </span>
    </button>
  );
}
