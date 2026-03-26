import dotenv from "dotenv";
dotenv.config();
const handleError = (err, req, res, next) => {
    const response = {
        message: err.message || "internal server error",
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    }
    return res.status(err.status).json(response);
}
export default handleError;