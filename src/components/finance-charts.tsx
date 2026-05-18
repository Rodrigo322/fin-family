"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { money } from "@/lib/format";

type ChartItem = {
  name: string;
  value: number;
  fill?: string;
};

export function CategoryPieChart({ data }: { data: ChartItem[] }) {
  if (!data.length) {
    return <div className="grid h-64 place-items-center text-sm text-slate-500">Sem gastos categorizados neste mês.</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.fill ?? "#047857"} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => money(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MethodBarChart({ data }: { data: ChartItem[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => money(Number(value)).replace("R$", "")} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => money(Number(value))} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.fill ?? "#2563eb"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
