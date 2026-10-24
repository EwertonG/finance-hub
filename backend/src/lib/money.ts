export function splitAmount(total: number, parts: number): number[] {
  const totalCents = Math.round(total * 100);
  const baseCents = Math.floor(totalCents / parts);
  const remainderCents = totalCents - baseCents * parts;

  return Array.from({ length: parts }, (_, i) =>
    (i === parts - 1 ? baseCents + remainderCents : baseCents) / 100
  );
}
