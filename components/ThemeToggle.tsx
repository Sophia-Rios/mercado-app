/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }: { className?: string }) {
  // sempre renderiza Moon no primeiro paint (igual ao servidor, que não tem
  // acesso a document/localStorage) e só lê o tema real depois de montar —
  // evita hydration mismatch quando o ThemeScript já deixou a página em dark
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const proximo = !dark;
    setDark(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("theme", proximo ? "dark" : "light");
    const favicon = document.getElementById("app-favicon") as HTMLLinkElement | null;
    if (favicon) favicon.href = proximo ? "/favicon-dark.svg" : "/favicon-light.svg";
  }

  return (
    <button onClick={alternar} aria-label="Alternar tema" className={className}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
