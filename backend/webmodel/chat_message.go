package webmodel

import (
	"time"
)

// ChatMessage represents a message sent by a user in the chat system.
type ChatMessage struct {
	UserName   string    `json:"userName,omitempty"`   // Optional: The name of the user sending the message.
	Content    string    `json:"content"`              // Required: The message content.
	DateCreate time.Time `json:"dateCreate,omitempty"` // Optional: Timestamp of when the message was created.
}

// Validate checks the ChatMessage for any invalid data.
// Returns an error message if validation fails, otherwise returns an empty string.
func (m *ChatMessage) Validate() string {
	// Ensure the message date is not before January 1, 2024 (used to prevent outdated messages).
	if m.DateCreate.Before(time.Date(2024, time.January, 1, 0, 0, 0, 0, time.UTC)) {
		return "Date is too old"
	}

	// Ensure the message content is not empty.
	if IsEmpty(m.Content) {
		return "text is missing"
	}

	return "" // No validation errors.
}
