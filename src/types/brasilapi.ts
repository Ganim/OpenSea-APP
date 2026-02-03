/**
 * Tipos da BrasilAPI
 */

export interface BrasilAPIQsa {
  pais: string | null;
  nome_socio: string;
  codigo_pais: string | null;
  faixa_etaria: string;
  cnpj_cpf_do_socio: string;
  qualificacao_socio: string;
  codigo_faixa_etaria: number;
  data_entrada_sociedade: string;
  identificador_de_socio: number;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_socio: number;
  qualificacao_representante_legal: string;
  codigo_qualificacao_representante_legal: number;
}

export interface BrasilAPICnaeSecundario {
  codigo: number;
  descricao: string;
}

export interface BrasilAPIRegimeTributario {
  ano: number;
  cnpj_da_scp: string | null;
  forma_de_tributacao: string;
  quantidade_de_escrituracoes: number;
}

export interface BrasilAPICompanyData {
  uf: string;
  cep: string;
  qsa: BrasilAPIQsa[];
  cnpj: string;
  pais: string | null;
  email: string | null;
  porte: string;
  bairro: string;
  numero: string;
  ddd_fax: string;
  municipio: string;
  logradouro: string;
  cnae_fiscal: number;
  codigo_pais: string | null;
  complemento: string;
  codigo_porte: number;
  razao_social: string;
  nome_fantasia: string;
  capital_social: number;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  opcao_pelo_mei: boolean | null;
  descricao_porte: string;
  codigo_municipio: number;
  cnaes_secundarios: BrasilAPICnaeSecundario[];
  natureza_juridica: string;
  regime_tributario: BrasilAPIRegimeTributario[];
  situacao_especial: string;
  opcao_pelo_simples: boolean | null;
  situacao_cadastral: number;
  data_opcao_pelo_mei: string | null;
  data_exclusao_do_mei: string | null;
  cnae_fiscal_descricao: string;
  codigo_municipio_ibge: number;
  data_inicio_atividade: string;
  data_situacao_especial: string | null;
  data_opcao_pelo_simples: string | null;
  data_situacao_cadastral: string;
  nome_cidade_no_exterior: string;
  codigo_natureza_juridica: number;
  data_exclusao_do_simples: string | null;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel: string;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel: number;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro: string;
  descricao_motivo_situacao_cadastral: string;
  descricao_identificador_matriz_filial: string;
}

export interface BrasilAPIError {
  name: string;
  message: string;
  type: string;
}

export interface BrasilAPICepLocation {
  type: string;
  coordinates: {
    longitude: string;
    latitude: string;
  };
}

export interface BrasilAPICep {
  cep: string;
  state: string;
  city: string;
  neighborhood: string | null;
  street: string | null;
  service: string;
  location?: BrasilAPICepLocation;
}
