import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import DashBoard from "../features/chats/pages/DashBoard.jsx";
import AuthProtected from "../features/auth/components/AuthProtected.jsx";
export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthProtected>
                <DashBoard />
            </AuthProtected>
        ),
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/dashboard",
        element: <Navigate to="/" replace />
    },
]);
