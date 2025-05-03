import { bookmarkMock } from "../bookmarkMock";

export function withHttpClient(Component: any) {
  return async function WithHttpClient(props: any) {
    const searchParams = await props.searchParams;
    if(searchParams.http_state) {
      bookmarkMock.set(JSON.parse(atob(searchParams.http_state)));
    }
    const output = await Component(props);
    return output;
  };
}