import axios from "./axiosClient";

export const getRawMaterialHistory = (params) =>
  axios.get("/raw-materials/history", { params });
