import ResultTable from "./ResultTable";
import ChartRenderer from "./ChartRenderer";
import { useState } from "react";

export default function ResultCard({ data }) {

  const [showSQL, setShowSQL] = useState(false);

  if (!data) return null;

  const isSingleValue =
    data.data &&
    data.data.length === 1 &&
    Object.values(data.data[0]).filter(v => typeof v === "number").length === 1;

  const singleValue =
    isSingleValue
      ? Object.values(data.data[0]).find(v => typeof v === "number")
      : null;

  return (
    <div className="bg-[#0f172a] p-8 rounded-3xl shadow-xl border border-[#1e293b] space-y-8">

      {/* ================= INSIGHT SECTION ================= */}
      <div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          Insight
        </h2>

        <p className="text-gray-300 leading-relaxed">
          {data.answer}
        </p>
      </div>

      {/* ================= KPI CARD ================= */}
      {isSingleValue && (
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-6 rounded-2xl shadow-lg text-white text-center">
          <div className="text-sm opacity-80">Key Metric</div>
          <div className="text-4xl font-bold mt-2">
            {singleValue.toLocaleString()}
          </div>
        </div>
      )}

      {/* ================= CHART ================= */}
      {data.data && data.data.length > 1 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-3">
            Visual Analysis
          </h3>

          <ChartRenderer data={data.data} />
        </div>
      )}

      {/* ================= RELATIONSHIP ANALYSIS ================= */}
      {data.data && data.data.length > 1 && (
        <div className="bg-[#111827] p-4 rounded-xl border border-indigo-500/20">
          <h3 className="text-sm text-indigo-400 mb-2">
            Relationship Insight
          </h3>

          <p className="text-gray-300 text-sm">
            The visualization above highlights relationships between selected variables.
            Variations in the metric indicate potential dependency or distribution patterns
            across categories.
          </p>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <ResultTable data={data.data} />

      {/* ================= SQL SECTION ================= */}
      <div>
        <button
          onClick={() => setShowSQL(!showSQL)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          {showSQL ? "Hide SQL" : "Show Generated SQL"}
        </button>

        {showSQL && (
          <div className="mt-4 bg-black p-4 rounded-xl text-xs overflow-x-auto border border-[#1e293b]">
            <pre>{data.sql}</pre>
          </div>
        )}
      </div>

      {/* ================= EXECUTION TIME ================= */}
      <div className="text-xs text-gray-500">
        Execution Time: {data.executionTime}s
      </div>

    </div>
  );
}