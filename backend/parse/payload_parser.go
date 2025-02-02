package parse

import (
	"encoding/json"
	"github.com/Pomog/bomberman/backend/webmodel"
)

// PayloadToInt converts a JSON payload into an integer.
// Returns the parsed integer or an error if conversion fails.
func PayloadToInt(payload json.RawMessage) (int, error) {
	var number int
	err := json.Unmarshal(payload, &number) // Attempt to parse JSON into an integer
	if err != nil {
		return 0, err // Return 0 and error if parsing fails
	}
	return number, nil
}

// PayloadToString converts a JSON payload into a string.
// Returns the parsed string or an error if conversion fails.
func PayloadToString(payload json.RawMessage) (string, error) {
	var str string
	err := json.Unmarshal(payload, &str) // Attempt to parse JSON into a string
	if err != nil {
		return "", err // Return empty string and error if parsing fails
	}
	return str, nil
}

// PayloadToChatMessage converts a JSON payload into a ChatMessage struct.
// Returns the parsed ChatMessage object or an error if conversion fails.
func PayloadToChatMessage(payload json.RawMessage) (webmodel.ChatMessage, error) {
	var message webmodel.ChatMessage
	err := json.Unmarshal(payload, &message) // Attempt to parse JSON into a ChatMessage struct
	return message, err
}

// PayloadToAction converts a JSON payload into a PlrAction struct.
// Returns the parsed PlrAction object or an error if conversion fails.
func PayloadToAction(payload json.RawMessage) (webmodel.PlrAction, error) {
	var action webmodel.PlrAction
	err := json.Unmarshal(payload, &action) // Attempt to parse JSON into a PlrAction struct
	return action, err
}
