export function mensagemErroSupabase(error: { message: string } | null): string | null {
  if (!error) return null;
  return `Não consegui salvar: ${error.message}`;
}
