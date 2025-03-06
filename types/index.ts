export interface Produto {
  campanhaId?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  marcaId: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  status: string;
} 