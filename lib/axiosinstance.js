import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://youtube-clone-backend-p2dx.onrender.com",
});

export default axiosInstance;