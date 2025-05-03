import { describe, expect, it } from "vitest";
import { createHttpClient, HttpClient } from "../../index";
import { httpClientMock } from "../test";

describe("httpMock", () => {
  describe("WHEN using the default HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      httpClientMock.on("GET", "https://example.com").reply(200, {
        message: "first request",
      });

      const { body } = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(body).toEqual({ message: "first request" });
    });
  });

  describe.skip("WHEN using the default HttpClient AFTER it has been set once", () => {
    it("If no mock was set, an error must be thrown", async () => {
      await expect(
        HttpClient.request({
          method: "GET",
          url: "https://example.com",
        })
      ).rejects.toThrowError("Network Error");
    });
  });

  describe("WHEN using a custom HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      const CustomHttpClient = createHttpClient();

      httpClientMock
        .on("POST", "https://example.com")
        .reply(200, {
          message: "custom",
        })

      httpClientMock
        .on("GET", "https://example.com")
        .reply(200, {
          message: "default",
        });

      const customHttpResponse = await CustomHttpClient.request({
        method: "POST",
        url: "https://example.com",
        body: {
          message: "custom payload",
        }
      });
      expect(customHttpResponse.body).toEqual({ message: "custom" });
      expect(httpClientMock.history.at(0)?.body).toEqual(JSON.stringify({message: "custom payload"}));
      
      const defaultHttpResponse = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(defaultHttpResponse.body).toEqual({ message: "default" });
    });
  });
});