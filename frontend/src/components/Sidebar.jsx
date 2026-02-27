import { useEffect, useState } from "react";
import axios from "axios";
import UploadDataset from "./UploadDataset";

export default function Sidebar({ datasetId, setDatasetId }) {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/datasets");
      setDatasets(res.data);
    } catch (err) {
      console.error("Failed to fetch datasets", err);
    }
  };

  return (
    <div className="w-80 bg-[#0f172a] border-r border-[#1e293b] p-6 flex flex-col text-white">

      {/* Logo / Title */}
      <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        AI Analytics
      </h1>

      {/* Dataset Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">
          Select Dataset
        </label>

        <select
          value={datasetId || ""}
          onChange={(e) => setDatasetId(e.target.value)}
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Choose Dataset --</option>
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload New Dataset */}
      <UploadDataset
        setDatasetId={setDatasetId}
        refreshDatasets={fetchDatasets}
      />

      {/* Divider */}
      <div className="border-t border-[#1e293b] my-8"></div>

      {/* Query History Placeholder */}
      <div>
        <h2 className="text-sm text-gray-400 mb-3">Query History</h2>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="hover:text-indigo-400 cursor-pointer transition">
            Churn by Gender
          </p>
          <p className="hover:text-indigo-400 cursor-pointer transition">
            Revenue Trend
          </p>
        </div>
      </div>

    </div>
  );
}