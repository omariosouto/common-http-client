import { beforeEach } from "vitest";
import { resetCommonUIWeb } from "@omariosouto/common-ui-web/test-setup";
import { resetHttpClient } from "@omariosouto/common-http-client/test-setup";

beforeEach(() => {
  resetCommonUIWeb();
  resetHttpClient();
});