import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

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
    <div className="mt-6 h-80 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        
        {/* 1️⃣ Categorical + Numeric → Bar Chart */}
        {categoricalKeys.length > 0 && numericKeys.length === 1 && (
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey={primaryX} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={primaryY}
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </BarChart>
        )}

        {/* 2️⃣ Date/Numeric Trend → Line Chart */}
        {categoricalKeys.length === 0 && numericKeys.length === 1 && (
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey={primaryX} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={primaryY}
              stroke="#22d3ee"
              strokeWidth={3}
            />
          </LineChart>
        )}

        {/* 3️⃣ Two Numeric → Scatter */}
        {numericKeys.length >= 2 && (
          <ScatterChart>
            <CartesianGrid stroke="#1e293b" />
            <XAxis type="number" dataKey={numericKeys[0]} stroke="#94a3b8" />
            <YAxis type="number" dataKey={numericKeys[1]} stroke="#94a3b8" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={data}
              fill="#6366f1"
            />
          </ScatterChart>
        )}

      </ResponsiveContainer>
    </div>
  );
}