import { Card } from "@/components/ui/card";

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </Card>
  );
}
