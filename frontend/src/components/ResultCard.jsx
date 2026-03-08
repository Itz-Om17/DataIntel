import ResultTable from "./ResultTable";
import ChartRenderer from "./ChartRenderer";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  CheckSquare,
  Search,
  Lightbulb,
  Table as TableIcon,
  BarChart2,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Loader2
} from "lucide-react";

export default function ResultCard({ data }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  if (!data) return null;

  // Robustly extract a named JSON field from a raw string.
  // Works even if Llama puts the field outside the closing brace.
  function extractField(text, fieldName) {
    const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, '');
    const match = text.match(pattern);
    return match ? match[1] : "";
  }

  let bigNumber = "";
  let shortAnswer = "";
  let explanation = "";

  if (typeof data.answer === "string") {
    const raw = data.answer;
    // Try per-field extraction first (handles Llama putting fields outside braces)
    bigNumber = extractField(raw, "big_number");
    shortAnswer = extractField(raw, "answer");
    explanation = extractField(raw, "explanation");

    // If we got nothing from regex, fall back to full JSON.parse
    if (!shortAnswer && !explanation) {
      try {
        let cleanJsonStr = raw.trim();
        if (!cleanJsonStr.startsWith('{') && cleanJsonStr.includes('"answer":')) {
          cleanJsonStr = `{${cleanJsonStr}}`;
        }
        const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiObj = JSON.parse(jsonMatch[0]);
          bigNumber = aiObj.big_number || "";
          shortAnswer = aiObj.answer || "";
          explanation = aiObj.explanation || "";
        }
      } catch (e) {
        shortAnswer = raw;
      }
    }
  } else if (typeof data.answer === "object" && data.answer !== null) {
    bigNumber = data.answer.big_number || "";
    shortAnswer = data.answer.answer || "";
    explanation = data.answer.explanation || "";

  }

  const exportToExcel = () => {
    if (!data.data || data.data.length === 0) return;
    try {
      const ws = XLSX.utils.json_to_sheet(data.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Query Results");
      XLSX.writeFile(wb, `DataIntel_Export_${Date.now()}.xlsx`);
      setShowExportMenu(false);
    } catch (err) {
      console.error("Failed to export to Excel:", err);
    }
  };

  const exportToPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      // Small delay to ensure any UI states settle before capture
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: "#020617"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If the content is too tall for one page, we just let it scale down for a single clean visual
      // For highly detailed long reports, we would chunk it, but for a single card this approach is cleaner.
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DataIntel_Insight_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to export to PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full relative group min-w-0">

      {/* Export Button floating top right */}
      <div className="absolute -top-3 right-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] border border-[#475569] text-gray-300 font-medium px-3 py-1.5 rounded-lg text-xs shadow-xl transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-indigo-400" />}
            Export
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1 z-40 overflow-hidden">
              <button
                onClick={exportToPDF}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-[#1e293b] hover:text-white transition text-left"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                Save Card as PDF
              </button>
              {data.data && data.data.length > 0 && (
                <button
                  onClick={exportToExcel}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-[#1e293b] hover:text-white transition text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Export Data to Excel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div ref={cardRef} className="flex flex-col space-y-4 w-full bg-[#020617] p-2 -my-2 rounded-xl min-w-0">

        {/* ================= ANSWER SECTION ================= */}
        {shortAnswer && (
          <div className="rounded-xl overflow-hidden border border-[#052e16] bg-[#020617] shadow-lg max-w-full">
            <div className="bg-[#064e3b] px-4 py-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-bold text-xs tracking-wider">ANSWER</span>
            </div>
            <div className={`p-4 border-t border-[#064e3b] bg-[#082f49]/20 flex flex-col max-w-full ${bigNumber ? 'items-center justify-center text-center py-10' : 'items-start justify-start'}`}>
              {bigNumber && <div className="text-5xl font-extrabold text-[#38bdf8] tracking-tight mb-3 drop-shadow-md break-all max-w-full overflow-hidden">{bigNumber}</div>}
              <div className={`leading-relaxed whitespace-pre-wrap break-words max-w-full ${bigNumber ? 'text-gray-400 text-sm' : 'text-gray-300 text-sm'}`}>
                {shortAnswer}
              </div>
            </div>
          </div>
        )}

        {/* ================= SQL SECTION ================= */}
        {data.sql && (
          <div className="rounded-xl overflow-hidden border border-[#3b0764] bg-[#020617] shadow-lg max-w-full">
            <div className="bg-[#4c1d95] px-4 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-300 shrink-0" />
              <span className="text-purple-300 font-bold text-xs tracking-wider">SQL QUERY USED</span>
            </div>
            <div className="p-4 text-indigo-300 font-mono text-xs md:text-sm overflow-x-auto border-t border-[#4c1d95] bg-[#0f172a] max-w-full">
              <pre className="whitespace-pre-wrap break-all">{data.sql}</pre>
            </div>
          </div>
        )}

        {/* ================= EXPLANATION SECTION ================= */}
        {explanation && explanation !== shortAnswer && (
          <div className="rounded-xl overflow-hidden border border-[#1e3a8a] bg-[#020617] shadow-lg max-w-full">
            <div className="bg-[#1e40af]/60 px-4 py-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="text-blue-300 font-bold text-xs tracking-wider">EXPLANATION</span>
            </div>
            <div className="p-4 text-gray-300 text-sm leading-relaxed border-t border-[#1e3a8a] bg-[#172554]/30 whitespace-pre-wrap break-words max-w-full">
              {explanation}
            </div>
          </div>
        )}

        {/* ================= TABLE ================= */}
        {data.data && data.data.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-[#1e293b] bg-[#020617] shadow-lg max-w-full">
            <div className="bg-[#0f172a] px-4 py-2 flex items-center gap-2 border-b border-[#1e293b]">
              <TableIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">RAW RESULT TABLE</span>
            </div>
            <div className="p-0 bg-[#0f172a] max-w-full overflow-x-auto">
              <ResultTable data={data.data} />
            </div>
          </div>
        )}

        {/* ================= CHART SECTION ================= */}
        {data.data && data.data.length > 1 && (
          <div className="rounded-xl overflow-hidden border border-[#1e293b] bg-[#020617] shadow-lg max-w-full">
            <div className="bg-[#0f172a] px-4 py-3 flex items-center gap-2 border-b border-[#1e293b]">
              <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-bold text-xs tracking-wider">VISUALIZATION</span>
            </div>
            <div className="p-4 bg-[#0f172a] max-w-full overflow-hidden">
              {/* During PDF export, Recharts animations can cause blank charts, html2canvas catches it better if stable, but React responsive handles it generally well */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[300px]">
                  <ChartRenderer data={data.data} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}