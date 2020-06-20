import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { connectRoutes } from "redux-first-router";
import { dbMiddleware } from "./dbMiddleware";
import search from "./reducers/search";
import sense from "./reducers/sense";
import word from "./reducers/word";
import { RoutesMap } from "./routes";

const { reducer: location, middleware, enhancer } = connectRoutes(RoutesMap);

export default createStore(
  combineReducers({ location, search, word, sense }),
  composeWithDevTools(
    enhancer,
    applyMiddleware(middleware),
    applyMiddleware(dbMiddleware)
  )
);
