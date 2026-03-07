import { useState } from "react";
import { uploadDataset } from "../services/api";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadDataset({ projectId, chatId, token, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleUpload = async () => {
    if (!file) {
      showStatus("error", "Please select a CSV file first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      if (chatId) formData.append("chatId", chatId);

      const res = await uploadDataset(formData, token);

      setFile(null);
      // Reset the file input visually
      document.querySelectorAll('input[type="file"]').forEach(el => { el.value = ''; });

      if (onUploadComplete) onUploadComplete(res.data.datasetId);
    } catch (err) {
      console.error(err);
      showStatus("error", "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!projectId && !chatId) return null;

  return (
    <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-[#334155]/50 hover:border-[#334155] transition">
      <div className="flex flex-col gap-3">
        <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          Upload {chatId ? 'Chat' : 'Project'} Dataset
        </label>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => { setFile(e.target.files[0]); setStatus(null); }}
          className="w-full text-xs text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition"
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full py-2 rounded-xl text-xs font-bold transition ${loading || !file ? 'bg-[#334155] text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90'}`}
        >
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>

        {/* Inline status message — no browser alert */}
        {status && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${status.type === 'success' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/40 text-red-400 border border-red-500/30'}`}>
            {status.type === 'success'
              ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}