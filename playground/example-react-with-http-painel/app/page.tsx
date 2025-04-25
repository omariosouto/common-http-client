import { ClientSideScreen } from "./components";
import { getDemoData } from "./http";

export default async function Screen() {
  const ssr = await getDemoData();

  return (
    <>
      SSR - {JSON.stringify(ssr)}
      <br />
      <ClientSideScreen />
    </>
  )
}