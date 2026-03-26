import express from "express";
// import all contoller
import {
    login,
    register,
    verifyEmail,
    getMe,
    logout,
} from "../controller/userAuth.controller.js";
// import validator
import { registerValidator, loginValidator } from "../validator/auth.validator.js";
// import middleware
import isAuthMiddleware from "../middleware/isAuth.middleware.js";
const AuthRouter = express.Router();





// PERPLEXITY ----- register
AuthRouter.post("/register", registerValidator, register);

// PERPLEXITY ----- verify-email
AuthRouter.get("/verify-email", verifyEmail);

// PERPLEXITY ----- login
AuthRouter.post("/login", loginValidator, login);

// PERPLEXITY ----- get-me
AuthRouter.get("/get-me", isAuthMiddleware, getMe);

// PERPLEXITY ----- logout
AuthRouter.get("/logout", isAuthMiddleware, logout);

export default AuthRouter;
