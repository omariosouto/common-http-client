import { describe, it, expect } from "vitest";
import { createHttpClient } from "./index";

const httpClient = createHttpClient();

describe("createHttpClient()", () => {
  it("should be a function", () => {
    expect(createHttpClient).toBeTypeOf("function");
  });

  describe("httpClient", () => {
    it("must have the base contract", () => {
      expect(httpClient.get).toBeTypeOf("function");
      expect(httpClient.post).toBeTypeOf("function");
      expect(httpClient.put).toBeTypeOf("function");
      expect(httpClient.delete).toBeTypeOf("function");
      expect(httpClient.patch).toBeTypeOf("function");
      expect(httpClient.head).toBeTypeOf("function");
      expect(httpClient.options).toBeTypeOf("function");
    })
  })
})