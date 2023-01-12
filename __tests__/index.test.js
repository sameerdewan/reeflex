const { act, renderHook } = require("@testing-library/react-hooks");
const reeflex = require("../");

describe("reeflex", () => {
  let dispatch, useStore;
  const initialState = { count: 0 };
  const reducers = {
    count: (state, action) => {
      switch (action.type) {
        case "increment":
          return state + 1;
        case "decrement":
          return state - 1;
        default:
          return state;
      }
    }
  };
  const middleware1 = jest.fn((state, action, next) => next());
  const middleware2 = jest.fn((state, action, next) => next());
  const middleware3 = jest.fn((state, action, next) => next());
  
  beforeEach(() => {
    const loggerMiddleware = (newValue, action, next) => {
      console.log(`Action: ${action.type}`);
      next(newValue, action);
    };
    [dispatch, useStore] = reeflex(initialState, reducers, [loggerMiddleware]);
  });

  test("dispatch increments the count", () => {
    act(() => dispatch({ type: "increment" }));
    const { result } = renderHook(() => useStore((state) => state.count));
    expect(result.current).toBe(1);
  });

  test("dispatch decrements the count", () => {
    act(() => dispatch({ type: "decrement" }));
    const { result } = renderHook(() => useStore((state) => state.count));
    expect(result.current).toBe(-1);
  });

  test("dispatch thunk increments the count", () => {
    act(() =>
      dispatch((dispatch, getState) => {
        dispatch({ type: "increment" });
        dispatch({ type: "increment" });
      })
    );
    const { result } = renderHook(() => useStore((state) => state.count));
    expect(result.current).toBe(2);
  });

  test("dispatch thunk with getState increments the count", () => {
    act(() =>
      dispatch((dispatch, getState) => {
        expect(getState()).toEqual({ count: 0 });
        dispatch({ type: "increment" });
        dispatch({ type: "increment" });
      })
    );
    const { result } = renderHook(() => useStore((state) => state.count));
    expect(result.current).toBe(2);
  });

  test("middleware logs action", () => {
    console.log = jest.fn();
    act(() => dispatch({ type: "increment" }));
    expect(console.log).toHaveBeenCalledWith(`Action: increment`);
  });

  test("dispatch with same state does not update store", () => {
    act(() => dispatch({ type: "noop" }));
    const { result } = renderHook(() => useStore((state) => state.count));
    expect(result.current).toBe(0);
  });

  test("reeflex with required arguments", () => {
    const initialState = { count: 0 };
    const reducers = {
      count: (state, action) => state
    };
    reeflex(initialState, reducers);
  });
  
  test('should call all the middleware functions in order', () => {
    [dispatch, useStore] = reeflex(initialState, reducers, [
      middleware1,
      middleware2,
      middleware3,
    ]);
    const action = { type: "increment" };
    act(() => {
      dispatch(action);
    });
    expect(middleware1).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
      action,
      expect.any(Function)
    );
    expect(middleware2).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
      action,
      expect.any(Function)
    );
    expect(middleware3).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
      action,
      expect.any(Function)
    );
    const { result } = renderHook(() => useStore((state) => state));
    expect(result.current).toEqual({ count: 1 });
  });
});
