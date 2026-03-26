import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthProtected = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center transition-colors duration-300 bg-[#1c1c1d] dark:bg-[#1d1d1e]">
        <div className="flex flex-col items-center gap-4">
          {/* The Spinner - Adjusted border colors for visibility in both modes */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-white/10 border-t-orange-600 dark:border-t-orange-500"></div>
          
          {/* Theme-aware Loading Text */}
          <p className="text-lg font-semibold tracking-tight text-slate-500 dark:text-white/40">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
console.log(user.email)
  return children;
};

export default AuthProtected;
