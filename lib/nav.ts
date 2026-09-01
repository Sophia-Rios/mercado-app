import { Home, ShoppingCart, Package, Store, Search } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/lista", label: "Lista", icon: ShoppingCart },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/mercados", label: "Mercados", icon: Store },
  { href: "/buscar", label: "Buscar", icon: Search },
];

export const TITULOS_ROTA: Record<string, string> = {
  "/": "Início",
  "/lista": "Lista de compras",
  "/estoque": "Estoque",
  "/mercados": "Mercados",
  "/buscar": "Buscar",
  "/notificacoes": "Notificações",
  "/perfil": "Perfil",
};

export function tituloDaRota(pathname: string): string {
  if (TITULOS_ROTA[pathname]) return TITULOS_ROTA[pathname];
  if (pathname.startsWith("/mercados/")) return "Mercados";
  return "Mercado · Domus";
}
