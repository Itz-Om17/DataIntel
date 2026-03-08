import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatLayout from "./components/ChatLayout";
import DatasetReport from "./components/DatasetReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function ProtectedRoute({ children, token }) {
  if (!token) return <Navigate to="/login" />;
  return children;
}

function MainApp({ token, handleLogout }) {
  const [projectId, setProjectId] = useState(() => localStorage.getItem("activeProjectId") || null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("activeSessionId") || null);
  const [datasetId, setDatasetId] = useState(null);
  const [viewingDatasetId, setViewingDatasetId] = useState(null);
  const [datasetRefreshKey, setDatasetRefreshKey] = useState(0);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (projectId) localStorage.setItem("activeProjectId", projectId);
    else localStorage.removeItem("activeProjectId");
  }, [projectId]);

  useEffect(() => {
    if (sessionId) localStorage.setItem("activeSessionId", sessionId);
    else localStorage.removeItem("activeSessionId");
  }, [sessionId]);

  return (
    <div className="h-screen flex bg-[#0f172a] text-white overflow-hidden relative">
      <Sidebar
        projectId={projectId} setProjectId={setProjectId}
        sessionId={sessionId} setSessionId={setSessionId}
        setDatasetId={setDatasetId}
        viewingDatasetId={viewingDatasetId}
        setViewingDatasetId={setViewingDatasetId}
        handleLogout={handleLogout}
        token={token}
        onDatasetDeleted={() => setDatasetRefreshKey(k => k + 1)}
        sessionRefreshKey={sessionRefreshKey}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {viewingDatasetId ? (
        <DatasetReport
          datasetId={viewingDatasetId}
          token={token}
          onClose={() => setViewingDatasetId(null)}
        />
      ) : (
        <ChatLayout
          projectId={projectId}
          sessionId={sessionId}
          setSessionId={setSessionId}
          datasetId={datasetId} setDatasetId={setDatasetId}
          datasetRefreshKey={datasetRefreshKey}
          token={token}
          onSessionDeleted={() => {
            setSessionId(null);
            setSessionRefreshKey(k => k + 1);
          }}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
    </div>
  );
}

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — shown first */}
        <Route path="/" element={<Landing token={authToken} />} />

        {/* Auth */}
        <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
        <Route path="/register" element={<Register />} />

        {/* Main app — protected */}
        <Route
          path="/app"
          element={
            <ProtectedRoute token={authToken}>
              <MainApp token={authToken} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;