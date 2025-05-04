import { bookmarkMock } from "../bookmarkMock";

export function withHttpClient(Component: any) {
  return async function WithHttpClient(props: any) {
    const searchParams = await props.searchParams;
    if(searchParams.httpclient_state) {
      bookmarkMock.set(JSON.parse(atob(searchParams.httpclient_state)));
    }
    const output = await Component(props);
    return output;
  };
}