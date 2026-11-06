"use client";

import { useRef, useState } from "react";
import { Check, Trash2, Undo2 } from "lucide-react";

const LIMITE = 90; // px arrastados pra confirmar a ação

// linha que reage a arrastar: direita (verde) = marcar/desmarcar, esquerda
// (vermelho) = excluir. Funciona com dedo e com mouse.
export default function SwipeRow({
  children,
  onDireita,
  onEsquerda,
  desfazer = false,
  className = "",
}: {
  children: React.ReactNode;
  onDireita: () => void;
  onEsquerda: () => void;
  desfazer?: boolean;
  className?: string;
}) {
  const [dx, setDx] = useState(0);
  const [animando, setAnimando] = useState(false);
  const inicio = useRef<{ x: number; y: number; id: number } | null>(null);
  const arrastando = useRef(false);
  const largura = useRef(0);

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicio.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    arrastando.current = false;
    largura.current = e.currentTarget.offsetWidth;
  }

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    const p = inicio.current;
    if (!p) return;
    const mx = e.clientX - p.x;
    const my = e.clientY - p.y;
    if (!arrastando.current) {
      // só vira arrasto se for claramente horizontal; vertical continua rolando a página
      if (Math.abs(mx) < 10 || Math.abs(mx) < Math.abs(my) * 1.5) {
        if (Math.abs(my) > 10) inicio.current = null;
        return;
      }
      arrastando.current = true;
      e.currentTarget.setPointerCapture(p.id);
    }
    setDx(mx);
  }

  function soltar(confirmar: boolean) {
    const valor = dx;
    inicio.current = null;
    if (!arrastando.current) return;
    if (confirmar && Math.abs(valor) >= LIMITE) {
      setAnimando(true);
      setDx(valor > 0 ? largura.current : -largura.current);
      setTimeout(() => {
        (valor > 0 ? onDireita : onEsquerda)();
        setAnimando(false);
        setDx(0);
      }, 150);
    } else {
      setAnimando(true);
      setDx(0);
      setTimeout(() => setAnimando(false), 150);
    }
  }

  // evita que o "fim do arrasto" dispare o clique de um botão embaixo do dedo
  function aoClicar(e: React.MouseEvent) {
    if (arrastando.current) {
      e.stopPropagation();
      e.preventDefault();
      arrastando.current = false;
    }
  }

  const direita = dx > 0;
  const passou = Math.abs(dx) >= LIMITE;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div
        className={`absolute inset-0 flex items-center px-5 ${
          direita ? "justify-start bg-success text-white" : "justify-end bg-danger text-white"
        } ${dx === 0 ? "invisible" : ""}`}
      >
        {direita ? desfazer ? <Undo2 size={20} /> : <Check size={20} /> : <Trash2 size={20} />}
      </div>
      <div
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={() => soltar(true)}
        onPointerCancel={() => soltar(false)}
        onClickCapture={aoClicar}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animando ? "transform 150ms ease-out" : "none",
          touchAction: "pan-y",
          opacity: passou ? 0.9 : 1,
        }}
        className="relative bg-surface"
      >
        {children}
      </div>
    </div>
  );
}
