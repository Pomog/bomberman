# frontend-request-side

the requests from the frontend are generally started from vue components, such as buttons or other events

these requests themselves exist in the reactive components (refs) in reactive_elements folder. each component has it's own respective responsibility.

from there, the request is sent via the global ws object, where it goes to the backend.

# request format

the request model can be seen in the models folder in the frontend. it has a type, which the backend will use to route the request in the repliers map and payload, which consists of whatever payload the backend is designed to accept.

# backend-request-side

the request goes into the wsRouter.go, where it is sent to the replier map and directed based on the request type.
from there it is directed to controllers package, where all the respective handlers are.
there the request is processed in whichever way it needs to be (parsed, added to db etc).

# backend-response-side

in the same function, the response for the frontend is created. in the case of a successful response, the response object will be {result: "success", payload: {misc},}

# frontend-response-side

this response is then sent into the ws object again, where it will be parsed and sent into the ws_router.js, where the router object will route the response to their respective functions/handlers based on the response type. ``generally the response type is the same as the request type.``
usually these handlers exist in the components respective to the response function, such as renderPostList etc.

mostly these request/response functions exist in pairs, for example getComments to get the ws request and renderComments, to parse the response.
