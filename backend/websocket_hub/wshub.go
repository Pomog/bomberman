package websocket_hub

import (
	"encoding/json"
	"fmt"
)

// UNIVERSAL_ROOM_ID is a default room identifier, potentially for a global chat room.
const (
	UNIVERSAL_ROOM_ID = "UniversalRoom"
)

// Hub is responsible for managing active WebSocket clients and rooms.
type Hub struct {
	// Rooms stores all registered chat rooms in a thread-safe map.
	Rooms *SafeRoomsMap

	// Channel for broadcasting messages to all clients in a room.
	broadcast chan *message

	// Channels for registering and unregistering clients dynamically.
	clientRegister   chan *Client
	clientUnregister chan *Client

	// Channels for registering and unregistering rooms dynamically.
	roomRegister   chan *Room
	roomUnregister chan *Room
}

// NewHub initializes a new Hub instance with required communication channels.
func NewHub() *Hub {
	return &Hub{
		broadcast:        make(chan *message),
		Rooms:            NewSafeRoomsMap(),
		clientRegister:   make(chan *Client),
		clientUnregister: make(chan *Client),
		roomRegister:     make(chan *Room),
		roomUnregister:   make(chan *Room),
	}
}

// message represents a WebSocket message that will be broadcasted.
type message struct {
	content json.RawMessage      // Raw JSON data of the message.
	room    *Room                // The target room for the message.
	sentTo  chan map[string]bool // Map of users who successfully received the message.
}

// Run starts the Hub event loop, continuously processing incoming requests.
func (h *Hub) Run() {
	for {
		select {
		case room := <-h.roomRegister:
			// If the room does not exist, register it.
			if !h.isThereRoom(room) {
				h.Rooms.Set(room.ID, room)
				room.Registered <- true
			} else {
				fmt.Printf("Room ID %s is already registered\n", room.ID)
				room.Registered <- false
			}

		case room := <-h.roomUnregister:
			// If the room exists, remove it from the Hub.
			if h.isThereRoom(room) {
				h.Rooms.Delete(room.ID)
			}

		case client := <-h.clientRegister:
			// Register client if their room exists.
			if h.isThereRoom(client.Room) {
				client.Room.Clients.Set(client.UserName, client)
				client.Registered <- true
			} else {
				client.Registered <- false
			}

		case client := <-h.clientUnregister:
			// Remove the client from their room and update player numbers.
			if h.isThereRoom(client.Room) {
				deletedNumber := client.ClientUser.PlayerNumber
				if client.Room.isThereClient(client) {
					client.Room.DeleteClient(client)
					// TODO: Notify remaining clients that a user has left.
				}

				// Adjust player numbers after a client leaves.
				for _, cl := range client.Room.Clients.items {
					if cl.ClientUser.PlayerNumber > deletedNumber {
						cl.ClientUser.PlayerNumber--
					}
				}
			}

		case message := <-h.broadcast:
			// Broadcast message to all clients in the specified room.
			if h.isThereRoom(message.room) {
				usersSentTo := make(map[string]bool)
				for _, client := range message.room.Clients.items {
					usersSentTo[client.UserName] = sendMessageToClient(message.content, client)
				}
				message.sentTo <- usersSentTo
			}
		}
	}
}

// sendMessageToClient attempts to send a message to a client and removes inactive ones.
func sendMessageToClient(messageContent json.RawMessage, client *Client) bool {
	select {
	case client.ReceivedMessages <- messageContent:
		// Successfully sent the message.
		return true
	default:
		// Client’s message buffer is full; assume disconnection.
		close(client.ReceivedMessages)
		client.Room.DeleteClient(client)
		return false
	}
}

// RegisterRoomToHub registers a room in the Hub.
func (h *Hub) RegisterRoomToHub(r *Room) {
	h.roomRegister <- r
}

// UnRegisterRoomFromHub removes a room from the Hub.
func (h *Hub) UnRegisterRoomFromHub(r *Room) {
	h.roomUnregister <- r
}

// RegisterClientToHub registers a client in the Hub.
func (h *Hub) RegisterClientToHub(c *Client) {
	h.clientRegister <- c
}

// UnRegisterClientFromHub removes a client from the Hub.
func (h *Hub) UnRegisterClientFromHub(c *Client) {
	h.clientUnregister <- c
}

// isThereRoom checks if a room exists in the Hub.
func (h *Hub) isThereRoom(room *Room) bool {
	_, ok := h.Rooms.items[room.ID]
	return ok
}

// GetRoom retrieves a room by its ID.
func (h *Hub) GetRoom(id string) (*Room, bool) {
	h.Rooms.RLock()
	defer h.Rooms.RUnlock()
	room, ok := h.Rooms.items[id]
	return room, ok
}

// BroadcastMessageInRoom sends a message to all clients in a specific room.
func (h *Hub) BroadcastMessageInRoom(content json.RawMessage, room *Room) map[string]bool {
	message := &message{
		content: content,
		room:    room,
		sentTo:  make(chan map[string]bool),
	}

	h.broadcast <- message
	return <-message.sentTo
}
