export default function ResultTable({ data }) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto max-h-96 w-full">
      <table className="w-full text-sm text-gray-200">

        <thead className="bg-[#0f172a] sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-bold text-cyan-400 border-b border-[#1e293b] bg-[#0f172a]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-[#1e293b]/60 transition border-b border-[#1e293b]"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-3">
                  {typeof row[col] === "number"
                    ? row[col].toLocaleString()
                    : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}