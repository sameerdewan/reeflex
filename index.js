const { BehaviorSubject } = require("rxjs");
const { useEffect, useState, useMemo } = require("react");

const reeflex = (initialState, reducers, middleware = []) => {
  const store = new BehaviorSubject(initialState);

  const rootReducer = (state, action) => {
    const newState = {};
    for (const reducerName of Object.keys(reducers)) {
      newState[reducerName] = reducers[reducerName](state[reducerName], action);
    }
    return newState;
  };

  const dispatch = (actionOrThunk) => {
    if (typeof actionOrThunk === "function") {
      actionOrThunk(dispatch, () => store.value);
    } else {
      const currentValue = store.value;
      const newValue = rootReducer(currentValue, actionOrThunk);
      const areEqual = Object.keys(currentValue).every(
        (key) => currentValue[key] === newValue[key]
      );
      if (!areEqual) {
        const pipeline = middleware.concat((newValue, action) => {
          store.next(newValue);
        });
        const run = (i, value, action) => {
          try {
            pipeline[i](value, action, () => run(i + 1, value, action));
          } catch {}
        };
        run(0, newValue, actionOrThunk);
      }
    }
  };

  const useStore = (selector) => {
    const [state, setState] = useState(initialState);

    useEffect(() => {
      const subscription = store.subscribe((value) => {
        setState(value);
      });
      return () => subscription.unsubscribe();
    }, []);

    const memoizedState = useMemo(() => {
      return selector(state);
    }, [state]);

    return memoizedState;
  };

  return [dispatch, useStore];
};

module.exports = reeflex;
