<figure>
  <p align-content='center'>
    <img src='reeflex.png' />
  </p>
</figure>

# Introduction

Reeflex is a lightweight library that provides a Redux-like store and hooks for React applications. It is designed to be easy to use and flexible, allowing you to manage your application's state in a predictable and efficient way.

You don't need to use libraries like `reselect` or `redux-thunk` with Reeflex.
Selectors are memoized out of the box, and asynchronous dispatch capability is built in.

Unlike Redux, you can easily create state stores that are completely independent of each other as well. The application is not nested in a `<Provider />` component, and can be "plug and play" anywhere in your application.

You can also easily migrate your existing Redux reducers to Reeflex.

Reeflex is perfect for times when you need React to just...react.

## Installation

To install Reeflex, run the following command:
`npm install reeflex`
or
`yarn add reeflex`

## Quick Start

To use Reeflex, you need to create a store by calling the reeflex function and passing it your initial state and reducer functions. Then, you can use the store's dispatch function to dispatch actions and update the state, and the useStore hook to subscribe to the store and receive updates to the state in your React components. A Reeflex initial state (slices) key entries must match the reducer they map to. Initial state is essentially a representation of all slices of state. These slices can be declared independently, and then later combined.

Here is an example of a simple counter application:

```jsx
import React from "react";
import { render } from "react-dom";
import reeflex from "reeflex";

const initialState = {
  count: 0
};

const reducers = {
  count: (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return state + 1;
      case 'DECREMENT':
        return state - 1;
      default:
        return state;
    }
  };
};

const [ dispatch, useStore ] = reeflex(initialState, reducers);

const Counter = () => {
  const { count } = useStore((state) => state);

  return (
    <div>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
    </div>
  );
};

render(<Counter />, document.getElementById("root"));
```

## API Reference

`reeflex(initialState, reducers)`
Creates a Redux-like store and hooks for React.

### Arguments

`initialState` (Object): The initial state of the store.
reducers (Object): An object where the keys are reducer names and the values are reducer functions.
Returns
An object containing the following properties:

`dispatch` (Function): A function that dispatches an action or a thunk.
useStore (Function): A hook that allows a component to subscribe to the store and receive updates to the store's state.
dispatch(actionOrThunk)
Dispatches an action or a thunk. Returns void.

```
actionOrThunk (Object|Function): The action object or thunk to be dispatched.
```

`useStore` (selector)
A hook that allows a component to subscribe to the store and receive updates to the store's state.

```
selector (Function): A function that takes the store's state and returns a derived piece of state.
Returns the derived state.
```

## Examples

### Asynchronous Actions

To perform asynchronous actions, such as making API calls, you can use the dispatch function inside a thunk. A thunk is a function that can dispatch actions and has access to the dispatch function and the current state of the store as arguments.

Here is an example of an asynchronous action that makes an API call and dispatches success or error actions based on the result:

```javascript
import { apiCall } from "./api";

const asyncAction = () => (dispatch, getState) => {
  dispatch({ type: "ASYNC_START" });

  return apiCall()
    .then((response) => dispatch({ type: "ASYNC_SUCCESS", payload: response }))
    .catch((error) => dispatch({ type: "ASYNC_ERROR", error }));
};

dispatch(asyncAction());
```

You can also use the dispatch function inside the thunk to dispatch multiple actions. For example:

```javascript
const complexAsyncAction = () => (dispatch, getState) => {
  dispatch({ type: "REQUEST_START" });

  return apiCall()
    .then((response) => {
      dispatch({ type: "REQUEST_SUCCESS", payload: response });
      dispatch({ type: "ANOTHER_ACTION" });
    })
    .catch((error) => dispatch({ type: "REQUEST_ERROR", error }));
};

dispatch(complexAsyncAction());
```

### Selectors

You can use the useStore hook to select a derived piece of state from the store's state. A selector is a function that takes the store's state as an argument and returns a derived state.

Here is an example of a selector that selects the todos array from the store's state:

```javascript
const todosSelector = (state) => state.todos;

const TodosList = () => {
  const todos = useStore(todosSelector);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};
```

Selectors can also be used to perform more complex transformations on the store's state. For example:

```javascript
const completedTodosSelector = (state) =>
  state.todos.filter((todo) => todo.completed);

const TodosList = () => {
  const todos = useStore(completedTodosSelector);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};
```

### Redux DevTools

Reeflex can be used with the tooling you already know and love. Simply create a middleware function and pass it to the array of middleware that Reeflex accepts.

```javascript
import { useEffect } from "react";
import reeflex from "./reeflex";

const sendToDevTools = (newValue, action, next) => {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    window.__REDUX_DEVTOOLS_EXTENSION__.send(action, newValue, next);
  } else {
    next();
  }
};

const initialState = {
  count: 0
};

const reducers = {
  count: (state, action) => {
    switch (action.type) {
      case "INCREMENT":
        return state + 1;
      case "DECREMENT":
        return state - 1;
      default:
        return state;
    }
  }
};

const [dispatch, useStore] = reeflex(initialState, reducers, [sendToDevTools]);

const Counter = () => {
  const count = useStore((state) => state.count);

  return (
    <div>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <div>{count}</div>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
    </div>
  );
};
```
