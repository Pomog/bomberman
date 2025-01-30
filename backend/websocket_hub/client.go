package websocket_hub

import (
	"fmt"

	"github.com/gorilla/websocket"
)

// ClientUser represents a player with a name and assigned player number.
type ClientUser struct {
	UserName     string `json:"playerName"`   // The username of the player
	PlayerNumber int    `json:"playerNumber"` // Assigned player number in the game
}

// Client acts as an intermediary between the WebSocket connection and the Hub.
// It represents a connected player in the system.
type Client struct {
	ClientUser // Embeds ClientUser struct (inherits UserName and PlayerNumber)

	Room *Room // The room that the client belongs to

	// WebSocket connection for real-time communication
	Conn *websocket.Conn

	// Buffered channel for storing received messages before processing
	ReceivedMessages chan []byte

	// Channel to confirm client registration
	Registered chan bool
}

// NewClient creates and registers a new WebSocket client in the hub.
//
// Parameters:
// - hub: The WebSocket hub managing clients and rooms.
// - userName: The name of the client/player.
// - room: The room the client is joining.
// - conn: WebSocket connection instance for communication.
// - receivedMessages: (optional) Pre-existing channel for received messages.
// - clientRegistered: (optional) Pre-existing channel to confirm registration.
//
// Returns:
// - A pointer to the created Client instance.
// - An error if registration fails (e.g., the room does not exist).
func NewClient(hub *Hub, userName string, room *Room, conn *websocket.Conn, receivedMessages chan []byte, clientRegistered chan bool) (*Client, error) {
	client := &Client{
		ClientUser: ClientUser{UserName: userName},
		Room:       room,
		Conn:       conn,
	}

	// Initialize ReceivedMessages channel if not provided
	if receivedMessages == nil {
		client.ReceivedMessages = make(chan []byte, 256) // Buffered channel with a capacity of 256
	} else {
		client.ReceivedMessages = receivedMessages
	}

	// Initialize Registered channel if not provided
	if clientRegistered == nil {
		client.Registered = make(chan bool)
	} else {
		client.Registered = clientRegistered
	}

	// Register the client in the hub
	hub.RegisterClientToHub(client)

	// Wait for registration confirmation
	ok := <-client.Registered
	if !ok {
		return nil, fmt.Errorf("cannot create a client: room id '%s' does not exist", room.ID)
	}

	// Assign a player number based on the room size
	client.PlayerNumber = client.Room.Size()
	return client, nil
}

// WriteMessage sends a message to the client's message queue.
func (c *Client) WriteMessage(message []byte) {
	c.ReceivedMessages <- message
}

// String returns a formatted string representation of the client instance.
func (c *Client) String() string {
	return fmt.Sprintf("addr: %p || User:'%s' || connection: %p || channels: clientRegistered %p  |  ReceivedMessages %p",
		c, c.UserName, c.Conn, c.Registered, c.ReceivedMessages)
}
