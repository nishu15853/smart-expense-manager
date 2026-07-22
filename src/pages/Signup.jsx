import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function Signup() {
   const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
          `${API_BASE_URL}/api/auth/register` ,
        formData
    );

      // Save token and user
localStorage.setItem("token", response.data.token);
localStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

// Clear error
setErrorMessage("");

// Redirect to dashboard
navigate("/dashboard");
    } catch (error) {
setErrorMessage(
  error.response?.data?.message || "Something went wrong"
);    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div>
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <button type="submit">Signup</button>
        {errorMessage && (
  <div>
    <p style={{ color: "red" }}>{errorMessage}</p>

    {errorMessage.includes("already exists") && (
      <Link to="/login">
        Go to Login
      </Link>
    )}
  </div>
)}
      </form>

      <div style={{ marginTop: "15px", maxWidth: "250px" }}>
        <div style={{ display: "flex", alignItems: "center", margin: "15px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dadce0" }}></div>
          <span style={{ padding: "0 10px", color: "#70757a", fontSize: "12px" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dadce0" }}></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn} 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "10px",
            backgroundColor: "#ffffff",
            border: "1px solid #dadce0",
            borderRadius: "6px",
            color: "#3c4043",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
            e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: "4px" }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 0 0 0 9c0 1.5.37 2.93 1.02 4.19l2.94-2.45z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 2.02.94 4.96l2.94 2.45c.71-2.13 2.69-3.71 5.04-3.71z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Signup;