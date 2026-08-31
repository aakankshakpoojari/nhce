"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("w3hire_theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.theme = "light";
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.theme = "light";
      localStorage.setItem("w3hire_theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
      localStorage.setItem("w3hire_theme", "dark");
    }
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full bg-surface border border-surface-border flex items-center justify-center text-muted hover:text-foreground hover:border-moss/60 transition-colors shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
