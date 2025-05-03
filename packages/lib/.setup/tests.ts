import { beforeEach } from "vitest";
import { resetHttpClient } from "../src/test-setup";

beforeEach(() => {
  resetHttpClient();
});