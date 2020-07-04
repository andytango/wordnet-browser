import queryString from "query-string";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { connectRoutes } from "redux-first-router";
import { RoutesMap } from "./routes";

const { reducer: location, middleware, enhancer } = connectRoutes(RoutesMap, {
  querySerializer: queryString,
});

export default createStore(
  combineReducers({  location }),
  composeWithDevTools(enhancer, applyMiddleware(middleware))
);
