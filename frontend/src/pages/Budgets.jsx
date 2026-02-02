import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";


function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeCategoryId(categoryId) {
  if (!categoryId) return "";
  if (typeof categoryId === "string") return categoryId;
  if (typeof categoryId === "object" && categoryId._id) return String(categoryId._id);
  return String(categoryId);
}

export default function Budgets() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const [spentByCategory, setSpentByCategory] = useState([]);


  const expenseCategories = useMemo(() => {
    return Array.isArray(categories) ? categories.filter((c) => c.type === "expense") : [];
  }, [categories]);

  const loadData = async () => {
    setLoading(true);
    try {
      // categories
      const cats = await apiFetch("/categories");
      setCategories(Array.isArray(cats) ? cats : []);

      // budget (может быть 404 — это ок)
      try {
        const b = await apiFetch(`/budgets/${month}`);
        setBudget(b && typeof b === "object" ? b : null);
      } catch (err) {
        setBudget(null);
      }

      try {
  const report = await apiFetch(
    `/reports/top-categories?month=${month}&limit=100`
  );
  setSpentByCategory(report.data || []);
} catch {
  setSpentByCategory([]);
}


      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const saveLimit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      alert("Select a category");
      return;
    }

    const n = Number(limit);
    if (limit === "" || Number.isNaN(n) || n < 0) {
      alert("Enter a valid limit");
      return;
    }

    await apiFetch(`/budgets/${month}/item/${selectedCategoryId}`, {
      method: "PATCH",
      body: JSON.stringify({ limit: n }),
    });

    setLimit("");
    await loadData();
  };

  // ✅ безопасно достаём items
  const items = Array.isArray(budget?.items) ? budget.items : [];
  const getSpentForCategory = (catId) => {
  const item = spentByCategory.find(
    (s) => String(s.categoryId) === String(catId)
  );
  return item ? item.totalSpent : 0;
};


  return (
    <div className="container">
      <h2>Budgets</h2>

      <div style={{ marginBottom: 16 }}>
        <label>
          Month:&nbsp;
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </div>

      <h3>Set / Update limit</h3>
      <form onSubmit={saveLimit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">Select expense category</option>
          {expenseCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          min="0"
        />

        <button type="submit">Save</button>
      </form>

      <hr />

      <h3>Budget for {month}</h3>

      {loading && <p>Loading...</p>}

      {!loading && !budget && <p>No budget set for this month</p>}

      {!loading && budget && items.length === 0 && <p>Budget exists but has no items yet.</p>}

      {!loading && budget && items.length > 0 && (
        <ul>
  {items.map((item) => {
    const itemCatId = normalizeCategoryId(item.categoryId);
    const cat = categories.find((c) => c._id === itemCatId);

    const spent = getSpentForCategory(itemCatId);
    const exceeded = spent > item.limit;

    return (
      <li
        key={itemCatId}
        className={exceeded ? "budget-exceeded" : "budget-ok"}
      >
        <b>{cat?.name || "Unknown"}</b>
        <br />
        Limit: {item.limit}
        <br />
        Spent: {spent}
        {exceeded && <div>⚠️ Budget exceeded</div>}
      </li>
    );
  })}
</ul>

      )}
    </div>
  );
}
