import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 30px",
        backgroundColor: "#4F46E5",
        color: "white",
      }}
    >
      <h2>Smart Expense Manager</h2>

      <div>
        <Link
          to="/dashboard"
          style={{ color: "white", marginRight: "20px", textDecoration: "none" }}
        >
          Dashboard
        </Link>

        <Link
          to="/login"
          style={{ color: "white", marginRight: "20px", textDecoration: "none" }}
        >
          Login
        </Link>

        <Link
          to="/"
          style={{ color: "white", textDecoration: "none" }}
        >
          Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;