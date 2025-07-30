import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "../firebase.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (typeof auth.getRedirectResult === "function") {
      auth
        .getRedirectResult()
        .then((result) => {
          if (result) {
            toast.success("Successfully logged in with Google!");
            navigate("/dashboard", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Google login error:", error.message);
          toast.error("Failed to log in with Google. Please try again.");
          setError("Failed to log in with Google. Please try again.");
        })
        .finally(() => setLoading(false));
    } else {
      console.warn(
        "getRedirectResult is not available. Skipping redirect result check."
      );
      setLoading(false);
    }
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Email login error:", error.message);
      const errorMessage = getFriendlyErrorMessage(error.code);
      toast.error(errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast.success("Successfully logged in with Google!");
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Google login error:", error.code, error.message);
      const errorMessage = getFriendlyGoogleErrorMessage(error.code);
      toast.error(errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email. Please sign up.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      default:
        return "Failed to log in. Please try again.";
    }
  };

  const getFriendlyGoogleErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/popup-closed-by-user":
        return "Google login was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Popup was blocked by your browser. Please allow popups and try again.";
      case "auth/account-exists-with-different-credential":
        return "An account with this email already exists. Try a different login method.";
      default:
        return "Failed to log in with Google. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,10%,4%)] bg-[radial-gradient(circle_at_center,hsl(230,85%,60%,0.15),hsl(240,10%,4%)_70%)]">
      <div className="relative p-10 bg-[hsl(240,10%,6%)] bg-[linear-gradient(145deg,hsl(240,10%,6%),hsl(240,6%,8%))] shadow-[0_8px_32px_hsl(240,10%,2%,0.5),0_0_40px_hsl(230,85%,60%,0.3)] rounded-xl max-w-md w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,hsl(230,85%,60%),hsl(190,95%,55%))] opacity-10 pointer-events-none"></div>
        <h1 className="relative text-4xl font-extrabold mb-6 text-center text-[hsl(210,40%,98%)] tracking-tight">
          Log In
        </h1>
        <p className="relative mb-6 text-center text-[hsl(210,40%,98%)] text-sm font-medium">
          Log in to Career Scope AI.
        </p>
        {error && (
          <p className="relative text-red-400 mb-6 text-sm text-center font-medium bg-[hsl(240,10%,6%)] p-3 rounded-lg shadow-[0_4px_12px_hsl(240,10%,2%,0.3)]">
            {error}
          </p>
        )}
        <form onSubmit={handleEmailLogin} className="relative mb-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[hsl(210,40%,98%)] mb-2">
              Email <span className="text-red-500">*</span>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-[hsl(210,40%,98%)] mb-2">
              Password <span className="text-red-500">*</span>
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
            className={`w-full p-3 bg-[linear-gradient(135deg,hsl(230,85%,60%),hsl(190,95%,55%))] text-[hsl(210,40%,98%)] rounded-lg font-semibold hover:bg-[linear-gradient(135deg,hsl(190,95%,55%),hsl(230,85%,60%))] focus:outline-none focus:ring-2 focus:ring-[hsl(230,85%,60%)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_40px_hsl(230,85%,60%,0.3)] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 inline"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : null}
            Log in with Email
          </button>
        </form>
        <div className="relative mb-6">
          <hr className="border-[hsl(0,3%,73%)]" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[hsl(240,10%,6%)] px-2 text-[hsl(210,40%,98%)] text-sm font-medium">
            or
          </span>
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full p-3 bg-[hsl(240,10%,6%)] text-[hsl(210,40%,98%)] border border-[hsl(240,6%,15%)] shadow-[0_8px_32px_hsl(240,10%,2%,0.5)] rounded-lg hover:bg-[hsl(190,95%,55%)] hover:text-[hsl(210,40%,98%)] focus:outline-none focus:ring-2 focus:ring-[hsl(230,85%,60%)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          )}
          Sign in with Google
        </button>
        <p className="relative mt-4 text-sm text-center text-[hsl(210,40%,98%)] font-medium">
          New to the platform?{" "}
          <Link
            to="/signup"
            className="text-[hsl(230,85%,60%)] hover:text-[hsl(190,95%,55%)] hover:underline transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;