package webmodel

import "encoding/json"

// PlrAction represents an action performed by a player in the game.
type PlrAction struct {
	UserName string          `json:"playerName"` // The name of the player performing the action.
	Action   json.RawMessage `json:"action"`     // The action details in raw JSON format, allowing flexible action structures.
}

// PlayerInfo represents basic information about a player.
type PlayerInfo struct {
	UserName     string          `json:"playerName"`   // The player's username.
	PlayerNumber json.RawMessage `json:"playerNumber"` // The player's number, stored as raw JSON for flexible data types.
}
