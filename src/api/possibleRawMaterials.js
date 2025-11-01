import axiosClient from "./axiosClient";

export const getPossibleRawMaterials = () => 
  axiosClient.get("/possible-raw-materials");

export const createPossibleRawMaterial = (data) =>
  axiosClient.post("/possible-raw-materials", data);
