import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_LOGOS = "logos-mercados";

export function getLogoUrl(supabase: SupabaseClient, logoPath: string | null): string | null {
  if (!logoPath) return null;
  return supabase.storage.from(BUCKET_LOGOS).getPublicUrl(logoPath).data.publicUrl;
}

// redimensiona/comprime a imagem no cliente antes de subir (evita logos
// gigantes ocupando o bucket) e devolve o Blob já pronto pra upload
export function comprimirImagemParaLogo(file: File, tamanho = 160): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não consegui ler esse arquivo."));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Não consegui ler essa imagem. Tenta outra."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tamanho;
        canvas.height = tamanho;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas não suportado nesse navegador."));
          return;
        }
        const escala = Math.max(tamanho / img.width, tamanho / img.height);
        const w = img.width * escala;
        const h = img.height * escala;
        ctx.drawImage(img, (tamanho - w) / 2, (tamanho - h) / 2, w, h);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Não consegui gerar a imagem."))),
          "image/jpeg",
          0.85
        );
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function subirLogoMercado(
  supabase: SupabaseClient,
  mercadoId: string,
  file: File
): Promise<string> {
  const blob = await comprimirImagemParaLogo(file);
  const path = `${mercadoId}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_LOGOS)
    .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}
