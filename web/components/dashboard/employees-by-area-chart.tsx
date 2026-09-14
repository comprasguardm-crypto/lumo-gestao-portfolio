"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ["#0F172A", "#14D6B3", "#7C3AED", "#A3E635", "#64748B"];

export function EmployeesByAreaChart({
  data,
  total,
}: {
  data: { area: string; total: number }[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colaboradores por área</CardTitle>
        <CardDescription>Distribuição atual do quadro de funcionários</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto h-56 w-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="area"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} colaboradores`, name]}
                contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-semibold text-lumo-ink">{total}</span>
            <span className="text-xs text-lumo-slate">colaboradores</span>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {data.map((item, index) => (
            <li key={item.area} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-lumo-ink">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.area}
              </span>
              <span className="font-medium text-lumo-slate">{item.total}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
