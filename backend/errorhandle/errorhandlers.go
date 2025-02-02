package errorhandle

import (
	"fmt"
	"github.com/Pomog/bomberman/backend/server"
	"net/http"
	"runtime/debug"
)

// NotFound handles requests for undefined routes, responding with a 404 Not Found status.
// It also logs the wrong path attempted.
func NotFound(app *server.Application, w http.ResponseWriter, r *http.Request) {
	// Log the incorrect path accessed by the user
	app.ErrLog.Output(2, fmt.Sprintf("wrong path: %s", r.URL.Path))
	// Send a 404 Not Found response
	http.NotFound(w, r)
}

// ServerError handles internal server errors (500) and logs detailed information for debugging.
// It includes the error message and stack trace for better diagnostics.
func ServerError(app *server.Application, w http.ResponseWriter, r *http.Request, message string, err error) {
	// Log error with a detailed message and the stack trace
	app.ErrLog.Output(2, fmt.Sprintf("fail handling the page %s: %s. ERR: %v\nDebug Stack:  %s", r.URL.Path, message, err, debug.Stack()))
	// Send a 500 Internal Server Error response
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}

// ClientError handles client-side errors (4xx) and logs the specific error message provided.
// It sends the error status code with the error text in the response.
func ClientError(app *server.Application, w http.ResponseWriter, r *http.Request, errStatus int, logTexterr string) {
	// Log the error message
	app.ErrLog.Output(2, logTexterr)
	// Send the error status code along with the message
	http.Error(w, "ERROR: "+http.StatusText(errStatus)+logTexterr, errStatus)
}

// BadRequestError handles bad request errors (400), commonly used for invalid or malformed requests.
// It calls ClientError with a 400 status code.
func BadRequestError(app *server.Application, w http.ResponseWriter, r *http.Request, logTexterr string) {
	// Handle a bad request with a 400 error
	ClientError(app, w, r, http.StatusBadRequest, logTexterr)
}

// MethodNotAllowed handles cases where an HTTP method is not allowed for a specific route.
// It sets the "Allow" header to indicate the valid methods for that endpoint.
func MethodNotAllowed(app *server.Application, w http.ResponseWriter, r *http.Request, allowedMethods ...string) {
	// Panic if no methods are provided (prevents undefined behavior)
	if allowedMethods == nil {
		panic("no methods is given to func MethodNotAllowed")
	}
	// Construct a string listing the allowed methods
	allowdeString := allowedMethods[0]
	for i := 1; i < len(allowedMethods); i++ {
		allowdeString += ", " + allowedMethods[i]
	}
	// Set the "Allow" header with the list of valid methods
	w.Header().Set("Allow", allowdeString)
	// Call ClientError to send a 405 Method Not Allowed response
	ClientError(app, w, r, http.StatusMethodNotAllowed, fmt.Sprintf("using the method %s to go to a page %s", r.Method, r.URL))
}

// Forbidden handles access-denied situations (403), such as when the user tries to access a restricted resource.
// It sends a 403 Forbidden response and logs the reason for denial.
func Forbidden(app *server.Application, w http.ResponseWriter, r *http.Request, reason string) {
	// Log the access denial with the provided reason
	app.ErrLog.Output(2, fmt.Sprintf("access to '%s' was forbidden: '%s'", r.URL.Path, reason))
	// Set the response status to 403 Forbidden
	w.WriteHeader(http.StatusForbidden)
	// Send a simple message explaining that access is denied
	w.Write([]byte("Forbidden: Access denied"))
}
