import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";
import { apiUrl } from "../config/api";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch(apiUrl("/api/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Email verified successfully!");
        login(data);
        navigate("/");
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please provide an email address first.");
      return;
    }
    setError("");
    setMessage("");
    setIsResending(true);
    try {
      const res = await fetch(apiUrl("/api/auth/resend-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          data.message || "OTP resent successfully. Check your email.",
        );
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while resending. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Verify Email</h2>
        <p
          style={{
            textAlign: "center",
            color: "#a1a1aa",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          Please enter the 6-digit OTP sent to your email.
        </p>

        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "14px",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              color: "#22c55e",
              fontSize: "14px",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!(location.state && location.state.email)}
        />

        <input
          type="text"
          placeholder="Enter 6-Digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Numbers only
          maxLength={6}
          required
          style={{
            textAlign: "center",
            letterSpacing: "4px",
            fontSize: "18px",
          }}
        />

        <button type="submit" className="btn">
          Verify OTP
        </button>

        <p style={{ fontSize: "14px" }}>
          Didn't receive code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            style={{
              background: "none",
              border: "none",
              color: "#f97316",
              cursor: "pointer",
              fontWeight: "600",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyOTP;
