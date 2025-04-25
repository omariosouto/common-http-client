import { ClientSideScreen } from "./components";
import { getDemoData } from "./http";

export default async function Screen() {
  // TODO: This api call must also be intercepted by the HttpClient
  const ssr = await getDemoData();

  return (
    <>
      SSR - {JSON.stringify(ssr)}
      <br />
      <ClientSideScreen />
    </>
  )
}