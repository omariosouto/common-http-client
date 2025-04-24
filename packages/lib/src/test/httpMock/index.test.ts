import { describe, expect, it } from "vitest";
import { httpMock } from "src/test";
import { createHttpClient, HttpClient } from "src/index";

describe("httpMock", () => {
  describe("WHEN using the default HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      httpMock().onGet("https://example.com").reply(200, {
        data: "default",
      });

      const { data } = await HttpClient.get("https://example.com");

      expect(data).toEqual({ data: "default" });
    });
  });

  describe("WHEN using a custom HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      const customHttpClient = createHttpClient();
      httpMock(customHttpClient).onGet("https://example.com").reply(200, {
        data: "custom",
      });

      httpMock().onGet("https://example.com").reply(200, {
        data: "default",
      });

      const customHttpResponse = await customHttpClient.get("https://example.com");
      const defaultHttpResponse = await HttpClient.get("https://example.com");

      expect(customHttpResponse.data).toEqual({ data: "custom" });
      expect(defaultHttpResponse.data).toEqual({ data: "default" });
    });
  });
});