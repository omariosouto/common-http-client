import { describe, expect, it } from "vitest";
import { s } from "@omariosouto/common-schema";
import { schemaGenerate } from "@omariosouto/common-schema/test";
import { HttpClient } from "./index";
import { httpMock } from "../../test";
import { HttpClientBookmarks } from "../createHttpClient";

describe("HttpClient", () => {
  describe("WHEN making an HTTP call", () => {
    it("RETURNs it's mock it as expected", async () => {
      httpMock.on("GET", "https://example.com").reply(200, {
        message: "mocked data",
      });

      const { body } = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(body).toEqual({ message: "mocked data" });
    });
    describe("AND using bookmarks", () => {
      it("RETURNs it's mock it as expected", async () => {
        // =====================================================================
        const DemoWireInSchema = s.object({
          message: s.string(),
        });

        const bookmarks: HttpClientBookmarks = {
          "demo-request": {
            url: "https://mydomain.com/api/",
            methods: {
              GET: {
                response: { 200: DemoWireInSchema }
              },
            }
          },
        };
        // =====================================================================

        // 0. Set the mock
        const payloadMock = schemaGenerate(DemoWireInSchema);

        // 1. Add the proper mocks relative to the bookmarks
        httpMock.set(

          {
            "demo-request": {
              "get": {
                status: 200,
                body: payloadMock,
              }
            },
          }

        );

        // TODO: Make the output be body instead of data
        const { body } = await HttpClient.request({
          url: "demo-request",
          method: "GET",
          bookmarks,
        });

        expect(body).toEqual(payloadMock);
      });
    });
  });
});