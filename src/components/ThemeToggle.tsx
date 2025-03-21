
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-slate-700" />
      ) : (
        <Sun className="h-5 w-5 text-slate-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
