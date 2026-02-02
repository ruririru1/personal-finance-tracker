import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const loadCategories = async () => {
    const data = await apiFetch("/categories");
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (e) => {
  e.preventDefault();

  if (!name.trim()) {
    alert("Enter category name");
    return;
  }

  try {
    const res = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), type }),
    });

    console.log("created category:", res);

    setName("");
    await loadCategories();
  } catch (err) {
    console.error("addCategory error:", err);
    alert(err.message || "Failed to add category");
  }
};


  return (
    <div className="container">
      <h2>Categories</h2>

      <form onSubmit={addCategory}>
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button>Add</button>
      </form>

      <ul>
        {categories.map((c) => (
          <li key={c._id}>
            {c.name} ({c.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
