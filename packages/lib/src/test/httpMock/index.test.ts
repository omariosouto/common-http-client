import { describe, expect, it } from "vitest";
import { createHttpClient, HttpClient } from "src/index";
import { httpMock } from "src/test";

describe("httpMock", () => {
  describe("WHEN using the default HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      httpMock.on("GET", "https://example.com").reply(200, {
        data: "default",
      });

      const { data } = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(data).toEqual({ data: "default" });
    });
  });

  describe("WHEN using a custom HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      const CustomHttpClient = createHttpClient();

      httpMock
        .on("POST", "https://example.com")
        .reply(200, {
          data: "custom",
        })

      httpMock
        .on("GET", "https://example.com")
        .reply(200, {
          data: "default",
        });

      const customHttpResponse = await CustomHttpClient.request({
        method: "POST",
        url: "https://example.com",
        body: {
          data: "custom payload",
        }
      });
      expect(customHttpResponse.data).toEqual({ data: "custom" });

      const defaultHttpResponse = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(defaultHttpResponse.data).toEqual({ data: "default" });
    });
  });
});