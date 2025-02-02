import { filters } from "../src/todoApp/models/filter_model.js";

class Router {
  constructor() {
    this.routes = {};
  }

  //#Abstracting the DOM Routing System

  /** queries is a string of any type of query after the path, such as 'q=URLUtils.searchParams&topic=api'
   *
   * can also pass as an object:  {q: 'URLUtils.searchParams', topic: 'api'}
   *
   * @param {string|object=} queries
   * @param {string} path
   */
  routeTo(path, queries) { // pointless?
    const params = "";
    if (queries != undefined) {
      params += "/";
      if (typeof queries == "object") {
        for (const [key, val] of Object.entries(queries)) {
          params += `${key}=${val}&`;
        }
      } else if (typeof queries == "string") {
        params += queries;
      }
    }
    window.history.pushState({}, "", `/${path}${params}`);
    //window.location.href = `/${path}${params}`;
  }

  addRoute(route, callback) {
    this.routes[route] = callback;
  }
  /**
   *
   * @param {[{path: string, callback: function}]} routes
   */
  addRoutes(routes) {
    for (const route of routes) {
      this.addRoute(route.path, route.callback);
    }
  }
  // Give the correspondent route (template) or fail
  resolveRoute = (route) => {
    try {
      return this.routes[route];
    } catch (error) {
      return new Error("The route is not defined");
    }
  };
  router = (event) => {
    const url = window.location.hash.slice(1) || "/";
    const routeResolved = this.resolveRoute(url); // checks if the route exists
    if (routeResolved) {
      routeResolved(); // here we resolve the route
    } else {
      alert("Route not defined!");
    }
  };
}

/**
   * 
   * @param {[{path: string, callback: function}]} routes 
   */
function createRouter(routes) {
  const router = new Router()
  
  router.addRoutes(routes);

  window.addEventListener("load", router.router);
  window.addEventListener("hashchange", router.router);

  
  return router
}


export default createRouter


// materials to work through
