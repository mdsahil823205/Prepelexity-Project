import axios from "axios";
const api = axios.create({
    baseURL: "https://prepelexity-project.onrender.com/api/auth",
    withCredentials: true,
});
// this is the register api to register the user in backend
const register = async ({ email, username, password }) => {
    const response = await api.post("/register", { email, username, password });
    console.log(response.data);
    return response.data;
};
// this is the login api to login the user in backend
const login = async ({ email, password }) => {
    const response = await api.post("/login", { email, password });
    console.log(response.data);
    return response.data;
};
// this is the getme api to get the user data from backend
const getMe = async () => {
    const response = await api.get("/get-me");
    console.log(response.data);
    return response.data;
};
const logout = async () => {
    const response = await api.get("/logout");
    console.log(response.data);
    return response.data;
};

export { register, login, getMe, logout };
