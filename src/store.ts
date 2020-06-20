import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { connectRoutes } from "redux-first-router";
import { dbMiddleware } from "./dbMiddleware";
import { RoutesMap } from "./routes";
import search from './reducers/search'

const { reducer: location, middleware, enhancer } = connectRoutes(RoutesMap);

export default createStore(
  combineReducers({ location, search }),
  composeWithDevTools(
    enhancer,
    applyMiddleware(middleware),
    applyMiddleware(dbMiddleware)
  )
);
