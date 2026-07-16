"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { Radar as RadarIcon } from "lucide-react";

export default function WeaknessRadar({
  data,
}: {
  data: { name: string; pct: number }[];
}) {
  // A radar needs at least 3 axes to read as a shape rather than a line.
  const enough = data.length >= 3;
  const weakest = [...data].sort((a, b) => a.pct - b.pct)[0];

  return (
    <div className="rounded-xl border border-grayline p-5">
      <div className="flex items-center gap-2 font-semibold mb-3">
        <RadarIcon className="w-4 h-4" />
        Weakness radar
      </div>

      {!enough ? (
        <div className="text-sm text-graymute">
          Take mocks in at least three subjects to see your weakness radar.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke="#E5E5E5" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#4A4A4A", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: "#8A8A8A", fontSize: 10 }}
                  stroke="#E5E5E5"
                />
                <Radar
                  dataKey="pct"
                  stroke="#0A0A0A"
                  strokeWidth={2}
                  fill="#0A0A0A"
                  fillOpacity={0.06}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Avg score"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E5E5",
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {weakest && (
            <div className="text-sm text-graytext mt-2">
              Weakest area right now:{" "}
              <span className="font-medium text-ink">{weakest.name}</span> at{" "}
              {weakest.pct}%.
            </div>
          )}
        </>
      )}
    </div>
  );
}
