const TRADUCOES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "User already registered": "Já existe uma conta com esse e-mail.",
  "Password should be at least 6 characters": "A senha precisa ter pelo menos 6 caracteres.",
  "Unable to validate email address: invalid format": "Esse e-mail não parece válido.",
};

export function mensagemErroAuth(error: { message: string } | null): string | null {
  if (!error) return null;
  return TRADUCOES[error.message] ?? error.message;
}
