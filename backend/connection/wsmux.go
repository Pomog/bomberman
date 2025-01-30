package wsconnection

import (
	"github.com/Pomog/bomberman/backend/webmodel"
	"github.com/Pomog/bomberman/backend/websocket_hub"
	"log"
)

// Replier interface defines the contract for sending replies to WebSocket messages.
// Any struct that implements the SendReply method can be considered a Replier.
type Replier interface {
	// SendReply is used to send a reply for a specific WebSocket message.
	// It takes the current connection (UsersConnection) and a WebSocket message.
	SendReply(currConnection *UsersConnection, wsMessage webmodel.WSMessage) error
}

// FuncReplyCreator is a function type that creates a reply data based on the WebSocket message.
type FuncReplyCreator func(*UsersConnection, webmodel.WSMessage) (any, error)

// FuncReplier is a function type for replying to a WebSocket message.
// It can be used to define how the reply is processed and sent.
type FuncReplier func(*UsersConnection, webmodel.WSMessage) error

// WSmux struct is responsible for managing WebSocket handlers, logs, and connections in a hub.
type WSmux struct {
	// WShandlers is a map that associates message types with specific Replier handlers.
	WShandlers      map[string]Replier
	InfoLog, ErrLog *log.Logger        // Loggers for informational and error messages
	Hub             *websocket_hub.Hub // The WebSocket hub that manages connections and messages
}

// SendReply method for FuncReplyCreator creates the reply data and then sends it using the current connection's SendReply method.
// It ensures the reply is generated correctly before sending.
func (fRC FuncReplyCreator) SendReply(currConnection *UsersConnection, wsMessage webmodel.WSMessage) error {
	// Generate the reply data using the function
	replyData, err := fRC(currConnection, wsMessage)
	if err != nil {
		return err // If an error occurs while generating the reply data, return the error
	}

	// Send the reply to the WebSocket connection
	return currConnection.SendReply(wsMessage, replyData)
}

// SendReply method for FuncReplier directly sends a reply by invoking the function.
// It is a more straightforward approach where the reply function is defined inline.
func (fR FuncReplier) SendReply(currConnection *UsersConnection, wsMessage webmodel.WSMessage) error {
	// Directly call the function to handle the reply sending
	return fR(currConnection, wsMessage)
}
