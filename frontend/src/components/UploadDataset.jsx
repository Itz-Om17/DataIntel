import { useState } from "react";
import { uploadDataset } from "../services/api";

export default function UploadDataset({ setDatasetId, refreshDatasets }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadDataset(formData);

      setDatasetId(res.data.datasetId);
      refreshDatasets();
      alert("Dataset uploaded successfully 🚀");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#334155] shadow-lg">

      <label className="text-sm text-gray-400 block mb-2">
        Upload New Dataset
      </label>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full text-sm text-gray-300 mb-3"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-90 transition"
      >
        {loading ? "Uploading..." : "Upload Dataset"}
      </button>

    </div>
  );
}