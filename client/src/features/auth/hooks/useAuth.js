import { register, login, getMe, logout } from "../services/auth.api.js";
import { setUser, setLoading, setError } from "../context/auth.slice.js";
import { useDispatch } from "react-redux";

const useAuth = () => {
  const dispatch = useDispatch();

  const handleRegister = async ({ email, username, password }) => {
    try {
      dispatch(setLoading(true));

      const data = await register({ email, username, password });

      dispatch(setUser(data?.user));

      return data?.user;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || "failed to register"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      dispatch(setLoading(true));

      const data = await login({ email, password });

      dispatch(setUser(data?.user));

      return data?.user;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || "failed to login"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetMe = async () => {
    try {
      dispatch(setLoading(true));

      const data = await getMe();

      dispatch(setUser(data?.user));
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || "failed to get user"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || "failed to logout"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  return { handleRegister, handleLogin, handleGetMe, handleLogout };
};

export default useAuth;
