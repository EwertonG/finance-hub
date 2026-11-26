import { api } from '../../services/api';

// Nome do arquivo baixado: reflete o período exportado (mês ou ano inteiro).
export function buildExportFilename(year: number, month?: number): string {
  const period = month ? `${year}-${String(month).padStart(2, '0')}` : String(year);
  return `lancamentos-${period}.csv`;
}

// A rota exige o token no cabeçalho Authorization, então não dá para usar um
// simples <a href>. Baixa pelo axios como blob e dispara o download no navegador.
export async function downloadTransactionsCsv(
  params: Record<string, string | number | undefined>,
  filename: string
): Promise<void> {
  const response = await api.get<Blob>('/transactions/export', {
    params,
    responseType: 'blob',
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}