"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

export function MonthlyBalanceChart({
  income,
  expense,
}: {
  income: number;
  expense: number;
}) {
  const data = [
    { name: "income", value: income },
    { name: "expense", value: expense },
  ];

  return (
    <Card className="p-4">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            />
            <Bar dataKey="value" radius={8} fill="var(--color-accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
