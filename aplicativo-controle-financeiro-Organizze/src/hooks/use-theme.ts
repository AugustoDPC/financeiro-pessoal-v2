import { useEffect, useState } from "react";

type Tema = "light" | "dark";

export function useTheme(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(() => {
    const salvo = localStorage.getItem("tema") as Tema | null;
    if (salvo) return salvo;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("tema", tema);
  }, [tema]);

  const alternar = () => setTema((t) => (t === "dark" ? "light" : "dark"));

  return [tema, alternar];
}
