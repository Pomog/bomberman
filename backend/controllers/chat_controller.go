package controllers

import (
	"fmt"
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/parse"
	"github.com/Pomog/bomberman/backend/server"
	"github.com/Pomog/bomberman/backend/webmodel"
)

// Constants defining different types of chat rooms
const (
	PRIVATE_CHAT_ROOM = "private" // Represents a one-on-one chat room
	GROUP_CHAT_ROOM   = "group"   // Represents a group chat room
)

// ReplySendMessageToChat handles broadcasting messages to clients in a chat room.
// This function returns a WebSocket response handler (wsconnection.FuncReplyCreator),
// which processes incoming chat messages from a client and forwards them to the appropriate chat room.
func ReplySendMessageToChat(app *server.Application) wsconnection.FuncReplyCreator {
	return func(currConnection *wsconnection.UsersConnection, message webmodel.WSMessage) (any, error) {
		// Parse the incoming WebSocket message payload into a ChatMessage struct.
		chatMessage, err := parse.PayloadToChatMessage(message.Payload)
		if err != nil {
			// Return an error if the payload format is invalid.
			return nil, currConnection.WSError(fmt.Sprintf("Invalid payload for a chat message: '%s'", message.Payload), err)
		}

		// Validate the parsed chat message (e.g., check if required fields are present).
		errmessage := chatMessage.Validate()
		if errmessage != "" {
			// Return a "bad request" error if validation fails.
			return nil, currConnection.WSBadRequest(message, errmessage)
		}

		// Set the sender's username in the chat message (retrieved from the WebSocket connection).
		chatMessage.UserName = currConnection.Client.UserName

		// Send the chat message to all clients in the sender's chat room.
		_, _, err = currConnection.SendMessageToClientRoom(webmodel.InputChatMessage, chatMessage)
		if err != nil {
			// Return an error if message broadcasting fails.
			return nil, currConnection.WSError("sending message to client room failed", err)
		}

		// Return a success response ("sent") to the sender.
		return "sent", err
	}
}
