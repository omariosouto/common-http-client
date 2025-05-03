import { describe, it, expect } from "vitest";
import { createHttpClient } from "./index";

const httpClient = createHttpClient();

describe("createHttpClient()", () => {
  it("should be a function", () => {
    expect(createHttpClient).toBeTypeOf("function");
  });

  describe("httpClient", () => {
    it("must have the base contract", () => {
      expect(httpClient.request).toBeTypeOf("function");
    })
  })
})