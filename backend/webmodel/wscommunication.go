package webmodel

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// Constants representing result types for WebSocket responses.
const (
	SUCCESS_RESULT = "success" // Indicates a successful operation.
	ERROR_RESULT   = "error"   // Indicates an error in the operation.
)

// Constants representing different types of WebSocket messages.
const (
	ERROR_TYPE        = "ERROR"             // General error message type.
	UsersInRoom       = "usersInRoom"       // Message type for retrieving users in a room.
	RegisterNewPlayer = "registerNewPlayer" // Message type for registering a new player.
	SendMessageToChat = "sendMessageToChat" // Message type for sending a message to the chat.
	InputChatMessage  = "inputChatMessage"  // Message type for handling chat input.
	UserQuitChat      = "userQuitChat"      // Message type for when a user quits the chat.
	ReadyToStart      = "readyToStart"      // Message type for indicating readiness to start the game.
	StartGame         = "startGame"         // Message type for starting the game.
	PlayerAction      = "playerAction"      // Message type for handling player actions.
)

// ErrWarning represents a custom error that signifies a warning condition.
var ErrWarning = errors.New("Warning")

// Payload struct represents the actual data that will be sent in a WebSocket message.
// It includes a result (e.g., success or error) and optional data.
type Payload struct {
	Result string `json:"result"`         // The result of the operation (success/error).
	Data   any    `json:"data,omitempty"` // Any additional data related to the operation.
}

// WSMessage struct represents a WebSocket message. It contains a type and a payload.
type WSMessage struct {
	Type    string          `json:"type"`    // Type of the message (e.g., success, error).
	Payload json.RawMessage `json:"payload"` // The data payload of the message.
}

// String method returns a string representation of the WSMessage, useful for logging and debugging.
func (m *WSMessage) String() string {
	if m == nil {
		return "nil" // Return "nil" if the message is nil.
	}
	return fmt.Sprintf("Type: %s | Payload: %s\n", m.Type, m.Payload) // Return formatted message details.
}

// CreateReplyToRequestMessage creates a reply message to a request with a given result and data.
func (m *WSMessage) CreateReplyToRequestMessage(result string, data any) (json.RawMessage, error) {
	// Call CreateJSONMessage to generate a reply message.
	return CreateJSONMessage(m.Type, result, data)
}

// CreateJSONMessage creates a full WebSocket message (including type, result, and data),
// and then marshals it into JSON format to be sent over the WebSocket.
func CreateJSONMessage(messageType string, result string, data any) (json.RawMessage, error) {
	// Create the WebSocket message.
	wsMessage, err := createWSMessage(messageType, result, data)
	if err != nil {
		return nil, fmt.Errorf("CreateJSONMessage failed: %v", err) // Return an error if message creation fails.
	}

	// Marshal the WebSocket message into JSON format.
	jsonMessage, err := json.Marshal(wsMessage)
	if err != nil {
		return nil, fmt.Errorf("CreateJSONMessage failed: %v", err) // Return an error if marshalling fails.
	}
	return jsonMessage, nil // Return the JSON-encoded message.
}

// createWSMessage is a helper function that constructs a WebSocket message from type, result, and data.
func createWSMessage(messageType string, result string, data any) (WSMessage, error) {
	// Marshal the payload data into JSON format.
	payload, err := json.Marshal(Payload{Result: result, Data: data})
	if err != nil {
		return WSMessage{}, fmt.Errorf("createWSMessage failed: %v", err) // Return error if marshalling fails.
	}

	// Construct and return the WebSocket message.
	message := WSMessage{
		Type:    messageType,
		Payload: payload,
	}
	return message, nil
}

// IsEmpty checks if a string is empty or contains only whitespace, or if it's the string "undefined".
func IsEmpty(field string) bool {
	// Trim spaces and check for empty or "undefined" values.
	return strings.TrimSpace(field) == "" || field == "undefined"
}
