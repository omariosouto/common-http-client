import { bookmarkMock } from "@omariosouto/common-http-client";
import { ClientSideScreen } from "./components";
import { getDemoData } from "./http";


export default withHttpClient(Screen)

async function Screen() {
  const ssr = await getDemoData();

  return (
    <>
      SSR - {JSON.stringify(ssr)}
      <br />
      <ClientSideScreen />
    </>
  )
}

// Move this to a file that is not "use client"
function withHttpClient(Component: any) {
  return async function WithHttpClient(props: any) {
    const searchParams = await props.searchParams;
    if(searchParams.http_state) {
      bookmarkMock.set(JSON.parse(atob(searchParams.http_state)));
    }

    return <Component {...props} />;
  };
}