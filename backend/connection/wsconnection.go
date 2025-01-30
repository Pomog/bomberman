package wsconnection

import (
	"errors"
	"fmt"
	"runtime"
	"runtime/debug"
)

// WSError sends an error message to the front-end WebSocket connection (`conn`)
// and logs the error details along with the debug stack trace. It creates a JSON
// message of type 'ERROR' and sends it via the WebSocket connection.
func (uc *UsersConnection) WSError(errMessage string, err error) error {
	// Retrieve the function name from the caller for better error context.
	funcName := ""
	pc, _, _, ok := runtime.Caller(1)
	details := runtime.FuncForPC(pc)
	if ok && details != nil {
		funcName = details.Name()
	}

	// Append the function name to the error message for clearer logs.
	errMessage = funcName + ": " + errMessage
	// Log the error and the stack trace for debugging purposes.
	uc.WsServer.ErrLog.Output(2, fmt.Sprintf("websocket:: ERROR: %s: %v\nDebug Stack:  %s", errMessage, err, debug.Stack()))

	// Create a JSON message containing the error message to send to the client.
	wsMessage, err := webmodel.CreateJSONMessage(webmodel.ERROR_TYPE, "serverError", errMessage)
	if err != nil {
		// If message creation fails, send a plain error message to the client and log it.
		errText := fmt.Sprintf("websocket:: WSError:can't create serverError WSmessage: %v", err)
		uc.Client.WriteMessage([]byte(`"` + errText + `"`))
		uc.WsServer.ErrLog.Output(2, fmt.Sprintf("%s\nDebug Stack:  %s", errText, debug.Stack()))
		return fmt.Errorf("%s: %#v", errText, err)
	}
	// Send the created error message to the WebSocket client.
	uc.Client.WriteMessage(wsMessage)

	return fmt.Errorf("%s: %#v", errMessage, err)
}

// WSErrCreateMessage handles error message creation for WebSocket communication.
// It wraps WSError with a more specific error message for the WebSocket client.
func (uc *UsersConnection) WSErrCreateMessage(err error) error {
	return uc.WSError("creating message to websocket failed", err)
}

// WSBadRequest sends a "Bad Request" message to the WebSocket connection.
// It logs the request and sends an error message in reply to the request.
func (uc *UsersConnection) WSBadRequest(requestMessage webmodel.WSMessage, errMessage string) error {
	// Log the bad request error message.
	uc.WsServer.InfoLog.Printf("websocket:: send reply '%s' to: '%s'\n", errMessage, requestMessage.Type)

	// Create a reply message with the "Bad Request" error message.
	wsMessage, err := requestMessage.CreateReplyToRequestMessage(webmodel.ERROR_RESULT, errMessage)
	if err != nil {
		// If message creation fails, log the error and send a fallback message.
		errText := fmt.Sprintf("websocket:: can't create BadRequest WSmessage to '%s': %v", requestMessage.Type, err)
		uc.Client.WriteMessage([]byte(`"` + errText + `"`))
		uc.WsServer.ErrLog.Output(2, fmt.Sprintf("%s\nDebug Stack:  %s", errText, debug.Stack()))
		return fmt.Errorf("%s: %#v", errText, err)
	}
	// Send the created Bad Request message to the WebSocket client.
	uc.Client.WriteMessage(wsMessage)
	// Return a warning error indicating a bad request.
	return errors.Join(webmodel.ErrWarning, errors.New(errMessage))
}
