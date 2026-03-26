import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app.route.jsx";
import useAuth from "../features/auth/hooks/useAuth.js";
import { useEffect } from "react";
const App = () => {
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [handleGetMe])
  return <RouterProvider router={router} />;
};

export default App;
