export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  level: 'warning' | 'exceeded';
  budget: number;
  spent: number;
  percentage: number;
}

export interface BudgetUsage {
  name: string;
  budget: number;
  spent: number;
}

const WARNING_RATIO = 0.8;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function buildBudgetAlertMessage(alert: BudgetAlert) {
  if (alert.level === 'exceeded') {
    const over = alert.spent - alert.budget;
    const overText = over > 0 ? ` (${formatCurrency(over)} acima)` : '';
    return `Orçamento de ${alert.categoryName} estourado: ${formatCurrency(alert.spent)} de ${formatCurrency(alert.budget)}${overText}.`;
  }
  return `Atenção: você já usou ${alert.percentage}% do orçamento de ${alert.categoryName} (${formatCurrency(alert.spent)} de ${formatCurrency(alert.budget)}).`;
}

export function summarizeBudgets(items: BudgetUsage[]) {
  const exceeded: string[] = [];
  const warning: string[] = [];

  for (const item of items) {
    if (item.budget <= 0) continue;
    if (item.spent >= item.budget) exceeded.push(item.name);
    else if (item.spent >= item.budget * WARNING_RATIO) warning.push(item.name);
  }

  return { exceeded, warning };
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
}

export function buildBudgetSummaryMessage({ exceeded, warning }: { exceeded: string[]; warning: string[] }) {
  const parts: string[] = [];
  if (exceeded.length > 0) {
    parts.push(`${joinNames(exceeded)} ${exceeded.length === 1 ? 'estourou' : 'estouraram'} o orçamento`);
  }
  if (warning.length > 0) {
    parts.push(`${joinNames(warning)} ${warning.length === 1 ? 'está perto' : 'estão perto'} do limite`);
  }
  return parts.length > 0 ? `${parts.join(' · ')}.` : '';
}
