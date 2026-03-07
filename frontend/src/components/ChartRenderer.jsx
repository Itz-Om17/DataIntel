import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";

// Colors for the pie chart
const COLORS = ["#22d3ee", "#8b5cf6", "#34d399", "#f472b6", "#fbbf24", "#f87171"];

export default function ChartRenderer({ data }) {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);

  const numericKeys = keys.filter(
    (key) => typeof data[0][key] === "number"
  );

  const categoricalKeys = keys.filter(
    (key) => typeof data[0][key] !== "number"
  );

  if (keys.length < 2) return null;

  const primaryX = categoricalKeys[0] || numericKeys[0];
  const primaryY = numericKeys[0];

  return (
    <div className="w-full space-y-4">

      {/* 1️⃣ Categorical + Numeric → Bar Chart & Pie Chart */}
      {categoricalKeys.length > 0 && numericKeys.length === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto min-h-[400px] lg:h-96">
          {/* Bar Chart Panel */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex flex-col min-h-[300px] w-full shadow-md">
            <h4 className="text-xs text-cyan-400 font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              {primaryY} by {primaryX} (Bar)
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey={primaryX} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} width={40} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#22d3ee" }}
                  />
                  <Bar
                    dataKey={primaryY}
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Panel */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex flex-col min-h-[350px] w-full shadow-md">
            <h4 className="text-xs text-orange-400 font-bold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              {primaryX} Share (Pie)
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey={primaryY}
                    nameKey={primaryX}
                    cx="40%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    layout="horizontal"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "20px" }}
                    formatter={(value, entry, index) => {
                      // Find the exact data point from the original dataset
                      const item = data[index];

                      // Check if AI gave us an explicit 'percentage' field
                      let percentStr = "";
                      let hasExplicitPercent = false;

                      // Find any key that looks like 'percentage'
                      const pctKey = Object.keys(item).find(k => k.toLowerCase().includes('percent'));
                      if (pctKey && typeof item[pctKey] === 'string' && item[pctKey].includes('%')) {
                        percentStr = item[pctKey];
                        hasExplicitPercent = true;
                      } else if (pctKey && typeof item[pctKey] === 'number') {
                        percentStr = item[pctKey].toFixed(1) + '%';
                        hasExplicitPercent = true;
                      }

                      // Fallback to manual arithmetic if AI didn't provide a percentage
                      if (!hasExplicitPercent) {
                        const total = data.reduce((sum, d) => sum + Number(d[primaryY] || 0), 0);
                        percentStr = total > 0 ? ((Number(item[primaryY]) / total) * 100).toFixed(1) + '%' : '0%';
                      }

                      // Render the label (e.g. Month-to-month       55.0% - 3,875)
                      return (
                        <span className="text-gray-300 ml-1 inline-flex items-center mt-2 w-full max-w-[200px] truncate">
                          <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{value}</span>
                          <span className="text-gray-400 font-mono text-right flex shrink-0 gap-1 text-[11px]">
                            <span>{percentStr}</span>
                            <span className="opacity-50">&ndash;</span>
                            <span>{Number(item[primaryY]).toLocaleString()}</span>
                          </span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ Date/Numeric Trend → Line Chart */}
      {categoricalKeys.length === 0 && numericKeys.length === 1 && (
        <div className="h-80 w-full bg-[#111827] border border-[#1e293b] rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey={primaryX} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
              <Line
                type="monotone"
                dataKey={primaryY}
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 4, fill: "#22d3ee", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 3️⃣ Two Numeric → Scatter */}
      {numericKeys.length >= 2 && (
        <div className="h-80 w-full bg-[#111827] border border-[#1e293b] rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="#1e293b" />
              <XAxis type="number" dataKey={numericKeys[0]} stroke="#94a3b8" />
              <YAxis type="number" dataKey={numericKeys[1]} stroke="#94a3b8" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
              <Scatter
                data={data}
                fill="#6366f1"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}