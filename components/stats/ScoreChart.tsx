"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ScoreChart({
  data,
}: {
  data: { date: string; pct: number }[];
}) {
  return (
    <div className="rounded-xl border border-grayline p-5">
      <div className="font-semibold mb-3">Mock scores over time</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F4F4F5" />
            <XAxis dataKey="date" stroke="#8A8A8A" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#8A8A8A" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E5E5",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="#0A0A0A"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0A0A0A" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
