import jwt from "jsonwebtoken"

const isAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "token not found please login ",
            err: "token not found please login "
        })
    }
    try {

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

}

export default isAuthMiddleware
