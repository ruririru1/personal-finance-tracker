import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState(null);
  const [top, setTop] = useState([]);

  const loadData = async () => {
    const s = await apiFetch(`/reports/monthly-summary?month=${month}`);
    const t = await apiFetch(`/reports/top-categories?month=${month}&limit=5`);
    setSummary(s);
    setTop(t.data);
  };

  useEffect(() => {
    loadData();
  }, [month]);

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <label>
        Month:&nbsp;
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>

      {summary && (
        <div style={{ marginTop: 20 }}>
          <p><b>Income:</b> {summary.income}</p>
          <p><b>Expense:</b> {summary.expense}</p>
          <p><b>Balance:</b> {summary.balance}</p>
        </div>
      )}

      <h3>Top Expense Categories</h3>
      <ul>
        {top.map((c) => (
          <li key={c.categoryId}>
            {c.categoryName || "Unknown"} — {c.totalSpent}
          </li>
        ))}
      </ul>
    </div>
  );
}
