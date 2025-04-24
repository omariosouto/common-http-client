import { config } from ".setup/config";
import { s } from "@omariosouto/common-schema";
import { HttpClient, HttpClientBookmarks } from "@omariosouto/common-http-client";

const DemoWireInSchema = s.object({
  message: s.string(),
})

export const bookmarks = {
  "demo-request": {
    url: `${config.http.baseUrl}/api/`,
    methods: {
      get: {
        response: { 200: DemoWireInSchema }
      }
    }
  },
} satisfies HttpClientBookmarks;


export async function getDemoData() {
  return HttpClient.request({
    url: "demo-request",
    method: "GET",
    bookmarks,
  })
  .then(({ data }) => { // TODO: make the autocomplete
    return data;
  })
}