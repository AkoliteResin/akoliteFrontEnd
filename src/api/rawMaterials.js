import axios from "./axiosClient";

export const getRawMaterials = () =>
  axios.get("/raw-materials");

export const addRawMaterialStock = (data) =>
  axios.post("/raw-materials/add", data);
