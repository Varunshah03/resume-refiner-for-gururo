import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { auth, createUserWithEmailAndPassword } from "../firebase.js";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully! Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Email signup error:", error.message);
      const errorMessage = getFriendlyErrorMessage(error.code);
      toast.error(errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      default:
        return "Failed to sign up. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,10%,4%)] bg-[radial-gradient(circle_at_center,hsl(230,85%,60%,0.15),hsl(240,10%,4%)_70%)]">
      <div className="relative p-10 bg-[hsl(240,10%,6%)] bg-[linear-gradient(145deg,hsl(240,10%,6%),hsl(240,6%,8%))] shadow-[0_8px_32px_hsl(240,10%,2%,0.5),0_0_40px_hsl(230,85%,60%,0.3)] rounded-xl max-w-md w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,hsl(230,85%,60%),hsl(190,95%,55%))] opacity-10"></div>
        <h1 className="relative text-4xl font-extrabold mb-6 text-center text-[hsl(210,40%,98%)] tracking-tight">
          Sign Up
        </h1>
        <p className="relative mb-6 text-center text-[hsl(210,40%,98%)] text-sm font-medium">
          Create a new account to Career Scope AI.
        </p>
        {error && (
          <p className="relative text-red-400 mb-6 text-sm text-center font-medium bg-[hsl(240,10%,6%)] p-3 rounded-lg shadow-[0_4px_12px_hsl(240,10%,2%,0.3)]">
            {error}
          </p>
        )}
        <form onSubmit={handleEmailSignup} className="relative mb-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[hsl(210,40%,98%)] mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[hsl(240,10%,6%)] border border-[hsl(240,6%,15%)] rounded-lg text-[hsl(210,40%,98%)] focus:outline-none focus:ring-2 focus:ring-[hsl(230,85%,60%)] focus:border-transparent hover:border-[hsl(190,95%,55%)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_12px_hsl(240,10%,2%,0.2)]"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[hsl(210,40%,98%)] mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[hsl(240,10%,6%)] border border-[hsl(240,6%,15%)] rounded-lg text-[hsl(210,40%,98%)] focus:outline-none focus:ring-2 focus:ring-[hsl(230,85%,60%)] focus:border-transparent hover:border-[hsl(190,95%,55%)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_12px_hsl(240,10%,2%,0.2)]"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 bg-[linear-gradient(135deg,hsl(230,85%,60%),hsl(190,95%,55%))] text-[hsl(210,40%,98%)] rounded-lg font-semibold hover:bg-[linear-gradient(135deg,hsl(190,95%,55%),hsl(230,85%,60%))] focus:outline-none focus:ring-2 focus:ring-[hsl(230,85%,60%)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_40px_hsl(230,85%,60%,0.3)] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : null}
            Sign up with Email
          </button>
        </form>
        <p className="relative mt-4 text-sm text-center text-[hsl(210,40%,98%)] font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[hsl(230,85%,60%)] hover:text-[hsl(190,95%,55%)] hover:underline transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;