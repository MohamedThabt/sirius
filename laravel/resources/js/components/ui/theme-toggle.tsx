import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppearance } from "@/hooks/use-appearance";

export function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance();

  const toggleTheme = () => {
    // Simple toggle between light and dark (no system mode in toggle)
    const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const nextAppearance = isDarkMode ? 'light' : 'dark';
    updateAppearance(nextAppearance);
  };

  // Show icon based on current effective theme (considering system preference)
  const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 transition-all duration-300"
      title="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}