import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
          "https://smart-expense-manager-9exq.onrender.com/api/auth/register" ,
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
    </div>
  );
}

export default Signup;