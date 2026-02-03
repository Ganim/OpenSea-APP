export interface BrasilApiCnaeSecundario {
  codigo: number | string;
  descricao?: string | null;
}

export interface BrasilApiQsaItem {
  nome_socio?: string | null;
  qualificacao_socio?: string | null;
  qualificacao_representante_legal?: string | null;
  cnpj_cpf_do_socio?: string | null;
  data_entrada_sociedade?: string | null; // YYYY-MM-DD
}

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
  cep?: string | null;
  codigo_municipio_ibge?: number | string | null;
  ddd_telefone_1?: string | null;
  ddd_telefone_2?: string | null;
  cnae_fiscal?: number | string | null;
  cnae_fiscal_descricao?: string | null;
  cnaes_secundarios?: BrasilApiCnaeSecundario[];
  qsa?: BrasilApiQsaItem[];
}

export const brasilApiService = {
  async getCnpj(cnpj: string): Promise<BrasilApiCnpjResponse> {
    const cleaned = cnpj.replace(/\D/g, '');
    // Preferir rota proxy interna para evitar CORS e garantir limpeza
    const res = await fetch(`/api/external/brasilapi/cnpj/${cleaned}`, {
      method: 'GET',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err?.message || 'Falha ao consultar BrasilAPI');
    }
    return res.json();
  },
};
