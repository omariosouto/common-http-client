import { AxiosInstance } from "axios";

const instances: AxiosInstance[] = [];


export function addInstance(instance: AxiosInstance) {
  instances.push(instance);
  console.log("[1. addInstance]", instances.length);
}

export function getInstances() {
  console.log("[2. getInstances]", instances.length);
  return [...instances];
}