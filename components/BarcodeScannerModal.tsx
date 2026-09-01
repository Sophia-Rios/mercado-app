"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

export default function BarcodeScannerModal({
  onDetectado,
  onFechar,
}: {
  onDetectado: (codigo: string) => void;
  onFechar: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectadoRef = useRef(onDetectado);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    onDetectadoRef.current = onDetectado;
  }, [onDetectado]);

  useEffect(() => {
    let cancelado = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, _erroDecode, controls) => {
        controlsRef.current = controls;
        if (cancelado || !result) return;
        controls.stop();
        onDetectadoRef.current(result.getText());
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setErro(
          e instanceof Error && e.name === "NotAllowedError"
            ? "Permissão da câmera negada. Autorize o acesso à câmera pro navegador e tente de novo."
            : "Não consegui acessar a câmera nesse aparelho."
        );
      });

    return () => {
      cancelado = true;
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onFechar}>
      <div
        className="bg-surface w-full max-w-sm rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-medium">Ler código de barras</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>
        <div className="relative aspect-square bg-black">
          {erro ? (
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <p className="text-sm text-white text-center">{erro}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-20 border-2 border-white/70 rounded-lg pointer-events-none" />
            </>
          )}
        </div>
        <p className="px-5 py-3 text-xs text-muted text-center">Aponte a câmera pro código de barras do produto.</p>
      </div>
    </div>
  );
}
