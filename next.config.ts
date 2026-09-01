import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // evita o Next inferir a raiz errada do workspace por causa do
  // package-lock.json que existe em D:\Claude (pasta que guarda vários
  // projetos, não só este) — sem isso o build funciona, mas emite um aviso
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
