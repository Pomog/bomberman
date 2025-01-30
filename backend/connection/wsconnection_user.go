package wsconnection

import (
	"encoding/json"
	"github.com/Pomog/bomberman/backend/helpers"
	"github.com/Pomog/bomberman/backend/webmodel"
	"github.com/Pomog/bomberman/backend/websocket_hub"
)

type UsersConnection struct {
	Client   *websocket_hub.Client // Represents the WebSocket client associated with the user
	WsServer WSmux                 // WebSocket server that handles multiple WebSocket connections
}

/*
SendReply sends a successful reply to the front-end WebSocket client `uc.Client`.
It creates a reply message using the `requestMessage` and sends `data` as the payload.
If message creation fails, it calls the `WSErrCreateMessage` method to handle the error.
*/
func (uc *UsersConnection) SendReply(requestMessage webmodel.WSMessage, data any) error {
	// Create a reply message with the 'SUCCESS' result and the provided data
	wsMessage, err := requestMessage.CreateReplyToRequestMessage(webmodel.SUCCESS_RESULT, data)
	if err != nil {
		// If message creation fails, create and send an error message
		return uc.WSErrCreateMessage(err)
	}

	// Send the created message to the WebSocket client
	uc.Client.WriteMessage(wsMessage)
	// Log the message sent to the client channel for informational purposes
	uc.WsServer.InfoLog.Printf("send message %s to channel of client %p", helpers.ShortMessage(wsMessage), uc.Client)
	return nil
}

/*
SendSuccessMessage sends a successful message of type `messageType` with `data` as the payload.
It converts the message into JSON format and returns it.
If message conversion fails, it calls `WSErrCreateMessage` to handle the error.
*/
func (uc *UsersConnection) SendSuccessMessage(messageType string, data any) (json.RawMessage, error) {
	// Create a successful message with the provided type and data
	wsMessage, err := webmodel.CreateJSONMessage(messageType, webmodel.SUCCESS_RESULT, data)
	if err != nil {
		// If message creation fails, create and send an error message
		return wsMessage, uc.WSErrCreateMessage(err)
	}

	// Send the created message to the WebSocket client
	uc.Client.WriteMessage(wsMessage)
	return wsMessage, nil
}

/*
SendMessageToClientRoom sends a successful message of type `messageType` with `data` as the payload to the WebSocket client's room.
It returns the message in JSON format and a map that indicates whether the message was successfully sent to each client in the room.
If message creation fails, it calls `WSErrCreateMessage` to handle the error.
*/
func (uc *UsersConnection) SendMessageToClientRoom(messageType string, data any) (json.RawMessage, map[string]bool, error) {
	// Create a successful message for the room with the provided type and data
	wsMessage, err := webmodel.CreateJSONMessage(messageType, webmodel.SUCCESS_RESULT, data)
	if err != nil {
		// If message creation fails, create and send an error message
		return wsMessage, nil, uc.WSErrCreateMessage(err)
	}

	// Send the message to the room and get the map indicating the success of message sending
	sentMarksMap := uc.SendBytesToClientRoom(wsMessage)

	return wsMessage, sentMarksMap, nil
}

/*
SendBytesToClientRoom sends the raw byte data to the WebSocket client's room.
It returns a map that indicates whether the message was successfully sent to each client in the room.
*/
func (uc *UsersConnection) SendBytesToClientRoom(rawData []byte) map[string]bool {
	// Broadcast the raw message to all clients in the room and return the success map
	sentMarksMap := uc.WsServer.Hub.BroadcastMessageInRoom(rawData, uc.Client.Room)

	return sentMarksMap
}
