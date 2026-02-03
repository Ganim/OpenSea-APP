/**
 * Traduções de mensagens de erro da API
 * Mapeia mensagens em inglês para português
 */
export const errorMessages: Record<string, string> = {
  // ============= AUTENTICAÇÃO =============
  'Invalid credentials': 'Credenciais inválidas',
  'User not found': 'Usuário não encontrado',
  'User not found.': 'Usuário não encontrado',
  'Invalid password': 'Senha incorreta',
  'Email already exists': 'Este e-mail já está cadastrado',
  'Username already exists': 'Este nome de usuário já está em uso',
  'Invalid email': 'E-mail inválido',
  'Invalid username': 'Nome de usuário inválido',
  'User not authorized': 'Usuário não autorizado',
  'Unauthorized error': 'Erro de autorização',

  // ============= BLOQUEIO DE CONTA =============
  'User is temporarily blocked due to failed login attempts':
    'Usuário temporariamente bloqueado devido a tentativas de login falhas',

  // ============= RESET DE SENHA =============
  'Invalid reset code': 'Código de recuperação inválido',
  'Reset code expired': 'Código de recuperação expirado',
  'Email not found': 'E-mail não encontrado',
  'Failed to send email': 'Falha ao enviar e-mail',
  'Password reset is required before you can access the system':
    'Redefinição de senha obrigatória. Use o link enviado ou fale com o administrador.',

  // ============= REFRESH TOKEN =============
  'Invalid refresh token.': 'Token de atualização inválido',
  'Invalid refresh token': 'Token de atualização inválido',
  'Refresh token has been revoked.': 'Token de atualização foi revogado',
  'Refresh token has been revoked': 'Token de atualização foi revogado',
  'Refresh token has expired.': 'Token de atualização expirado',
  'Refresh token has expired': 'Token de atualização expirado',
  'Refresh token is required in Authorization header.':
    'Token de atualização é obrigatório no header de autorização',
  'Invalid refresh token format.': 'Formato de token de atualização inválido',
  'No refresh token available': 'Nenhum token de atualização disponível',
  'Failed to refresh token': 'Falha ao atualizar token',
  'Refresh token not found.': 'Token de atualização não encontrado',

  // ============= SESSÕES =============
  'Session not found.': 'Sessão não encontrada',
  'Session not found': 'Sessão não encontrada',
  'Session has expired.': 'Sessão expirada',
  'Session has expired': 'Sessão expirada',
  'Session has been revoked.': 'Sessão foi revogada',
  'Session has been revoked': 'Sessão foi revogada',
  'Session is already expired.': 'Sessão já está expirada',
  'Session is already revoked.': 'Sessão já está revogada',
  'Sessions not found.': 'Nenhuma sessão encontrada',
  'You can only revoke your own sessions.':
    'Você só pode revogar suas próprias sessões',
  'Unable to create session. Please verify the provided user ID and IP address.':
    'Não foi possível criar a sessão. Verifique o ID do usuário e o endereço IP fornecidos.',
  'Unable to create refresh token.':
    'Não foi possível criar o token de atualização',
  'Unable to update session.': 'Não foi possível atualizar a sessão',

  // ============= VALIDAÇÃO =============
  'Password too short': 'Senha muito curta',
  'Password too weak': 'Senha muito fraca',
  'Password is required': 'Senha é obrigatória',
  'Passwords do not match': 'As senhas não coincidem',
  'Password is not strong enough.':
    'A senha não atende aos requisitos de segurança.',
  'A senha deve ter pelo menos 6 caracteres.':
    'A senha deve ter pelo menos 6 caracteres.',
  'A senha deve ter pelo menos 8 caracteres.':
    'A senha deve ter pelo menos 8 caracteres.',
  'A senha deve conter pelo menos uma letra maiúscula.':
    'A senha deve conter pelo menos uma letra maiúscula.',
  'A senha deve conter pelo menos uma letra minúscula.':
    'A senha deve conter pelo menos uma letra minúscula.',
  'A senha deve conter pelo menos um número.':
    'A senha deve conter pelo menos um número.',
  'A senha deve conter pelo menos um caractere especial.':
    'A senha deve conter pelo menos um caractere especial.',
  'A senha não atende aos requisitos de segurança.':
    'A senha não atende aos requisitos de segurança.',
  'Field is required': 'Campo obrigatório',
  'Invalid format': 'Formato inválido',
  "Response doesn't match the schema":
    'Erro de validação no servidor. Verifique se o usuário existe e tem permissões configuradas.',
  'Validation error': 'Erro de validação dos dados',
  'Old password is required': 'Senha atual é obrigatória',
  'Token is required': 'Token é obrigatório',
  'Start date must be before end date':
    'Data inicial deve ser anterior à data final',

  // ============= RATE LIMIT =============
  'Too many requests, please try again later.':
    'Muitas requisições. Tente novamente mais tarde.',
  'Too many requests': 'Muitas requisições. Aguarde um momento.',
  'Rate limit exceeded': 'Limite de requisições excedido',

  // ============= ERROS GENÉRICOS =============
  'Something went wrong': 'Algo deu errado',
  'Network error': 'Erro de conexão',
  'Server error': 'Erro no servidor',
  'Internal server error': 'Erro interno do servidor',
  Unauthorized: 'Não autorizado',
  Forbidden: 'Acesso negado',
  'Not found': 'Não encontrado',
  'Request timeout': 'Tempo de requisição esgotado',

  // ============= ERROS HTTP =============
  'Bad Request': 'Requisição inválida',
  'Bad request error': 'Erro de requisição inválida',
  'Internal Server Error': 'Erro interno do servidor',
  'Service Unavailable': 'Serviço indisponível',
};

/**
 * Traduz uma mensagem de erro do inglês para português
 * @param error - Mensagem de erro ou objeto de erro
 * @returns Mensagem traduzida ou mensagem original se não houver tradução
 */
export function translateError(error: string | Error | unknown): string {
  if (!error) {
    return 'Ocorreu um erro desconhecido';
  }

  // Se for um objeto Error
  if (error instanceof Error) {
    const message = error.message;
    return errorMessages[message] || message || 'Ocorreu um erro desconhecido';
  }

  // Se for uma string
  if (typeof error === 'string') {
    return errorMessages[error] || error || 'Ocorreu um erro desconhecido';
  }

  // Se for um objeto com propriedade message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: string }).message;
    return errorMessages[message] || message || 'Ocorreu um erro desconhecido';
  }

  return 'Ocorreu um erro desconhecido';
}

/**
 * Adiciona uma nova tradução de erro
 * @param key - Chave da mensagem em inglês
 * @param value - Tradução em português
 */
export function addErrorTranslation(key: string, value: string): void {
  errorMessages[key] = value;
}
