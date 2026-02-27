import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatLayout from "./components/ChatLayout";

function App() {
  const [datasetId, setDatasetId] = useState(null);

  return (
    <div className="h-screen flex bg-[#0f172a] text-white">
      <Sidebar setDatasetId={setDatasetId} />
      <ChatLayout datasetId={datasetId} />
    </div>
  );
}

export default App;