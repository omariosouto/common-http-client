let state: any = {};

export const bookmarkMock = {
  get() {
    return state;
  },
  set(newState: any) {
    state = newState;
  }
}