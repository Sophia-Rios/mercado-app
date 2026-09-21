// lê o texto de um PDF no próprio navegador — a nota nunca sai do aparelho
// (a Fazenda protege a consulta com captcha, então o servidor não consegue abrir)
export async function extrairTextoPdf(arquivo: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

  const doc = await pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise;
  let texto = "";
  for (let n = 1; n <= doc.numPages; n++) {
    const conteudo = await (await doc.getPage(n)).getTextContent();
    texto +=
      conteudo.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : " ") : "")).join("") + "\n";
  }
  return texto;
}
