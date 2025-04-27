import { withHttpClient } from "@omariosouto/common-http-client";
import { ClientSideScreen } from "./components";
import { getDemoData } from "./http";


export default withHttpClient(Screen)

async function Screen() {
  const ssr = await getDemoData();

  return (
    <>
      SSR - {JSON.stringify(ssr)}
      <br />
      {/* 
      TODO: Add example of `onUploadProgress`
      TODO: Add example of `onDownloadProgress`
      */}
      <ClientSideScreen />
    </>
  )
}