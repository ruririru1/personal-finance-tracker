import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const loadData = async () => {
    const txs = await apiFetch("/transactions");
    const cats = await apiFetch("/categories");
    setTransactions(txs);
    setCategories(cats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addTransaction = async (e) => {
    e.preventDefault();
    await apiFetch("/transactions", {
      method: "POST",
      body: JSON.stringify({
        categoryId,
        amount: Number(amount),
        type:
          categories.find((c) => c._id === categoryId)?.type || "expense",
        date,
        note,
      }),
    });

    setAmount("");
    setDate("");
    setNote("");
    loadData();
  };

  return (
    <div className="container">
      <h2>Transactions</h2>

      <form onSubmit={addTransaction}>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button>Add</button>
      </form>

      <hr />

      <ul>
        {transactions.map((t) => (
          <li key={t._id}>
            {t.categoryId?.name || "Unknown"} — {t.amount} — {t.date.slice(0, 10)}
          </li>
        ))}
      </ul>
    </div>
  );
}
