import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Link to="/">Dashboard</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/budgets">Budgets</Link>
      <Link to="/about">About</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
