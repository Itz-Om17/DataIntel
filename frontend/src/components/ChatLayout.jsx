import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import ResultCard from "./ResultCard";

export default function ChatLayout({ datasetId }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async () => {
    if (!datasetId) {
      alert("Please select a dataset first.");
      return;
    }

    if (!question.trim()) return;

    const userMsg = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await askQuestion({
        datasetId,
        question
      });

      const aiMsg = {
        type: "ai",
        data: res.data
      };

      setMessages((prev) => [...prev, aiMsg]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      alert("Query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#020617] text-white">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10">

        {messages.map((msg, i) =>
          msg.type === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 rounded-2xl max-w-lg shadow-lg">
                {msg.text}
              </div>
            </div>
          ) : (
            <ResultCard key={i} data={msg.data} />
          )
        )}

        {loading && (
          <div className="text-indigo-400 animate-pulse">
            AI is analyzing your data...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="p-6 border-t border-[#1e293b] bg-[#0f172a]">
        <div className="flex items-center bg-[#1e293b] rounded-2xl overflow-hidden border border-[#334155]">

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about your data..."
            className="flex-1 bg-transparent p-4 focus:outline-none text-gray-200"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-90 transition"
          >
            Ask
          </button>

        </div>
      </div>

    </div>
  );
}