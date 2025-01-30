package websocket_hub

import (
	"fmt"
	"sync"
)

// SafeClientsMap is a thread-safe map for storing active clients in a room.
// It ensures concurrent access is synchronized using a read-write mutex.
type SafeClientsMap struct {
	sync.RWMutex
	items map[string]*Client
}

// NewSafeClientsMap creates and initializes a new SafeClientsMap.
func NewSafeClientsMap() *SafeClientsMap {
	sm := &SafeClientsMap{}
	sm.items = make(map[string]*Client)
	return sm
}

// Room represents a chat or game session where multiple clients (users) interact.
type Room struct {
	ID         string          `json:"id"` // Unique room identifier
	Clients    *SafeClientsMap `json:"-"`  // Connected clients
	Registered chan bool       // Channel for room registration confirmation
	GameMap    string          // Random string representing the game map (generated externally)
}

// SafeRoomsMap is a thread-safe map for managing multiple rooms.
type SafeRoomsMap struct {
	sync.RWMutex
	items map[string]*Room
}

// NewSafeRoomsMap creates and initializes a new SafeRoomsMap.
func NewSafeRoomsMap() *SafeRoomsMap {
	sm := &SafeRoomsMap{}
	sm.items = make(map[string]*Room)
	return sm
}

// Set adds or updates a client in SafeClientsMap.
func (sm *SafeClientsMap) Set(key string, value *Client) {
	sm.Lock()
	defer sm.Unlock()
	sm.items[key] = value
}

// Get retrieves a client by key (username).
func (sm *SafeClientsMap) Get(key string) (value *Client, ok bool) {
	sm.RLock()
	defer sm.RUnlock()
	value, ok = sm.items[key]
	return value, ok
}

// Len returns the number of connected clients in a room.
func (sm *SafeClientsMap) Len() int {
	sm.RLock()
	defer sm.RUnlock()
	return len(sm.items)
}

// Delete removes a client from the room.
func (sm *SafeClientsMap) Delete(key string) {
	sm.Lock()
	defer sm.Unlock()
	delete(sm.items, key)
}

// RRange iterates over all clients in the room, applying a given function.
func (sm *SafeClientsMap) RRange(act func(key string, value *Client)) {
	sm.RLock()
	defer sm.RUnlock()
	for key, value := range sm.items {
		act(key, value)
	}
}

// Set adds or updates a room in SafeRoomsMap.
func (sm *SafeRoomsMap) Set(key string, value *Room) {
	sm.Lock()
	defer sm.Unlock()
	sm.items[key] = value
}

// Get retrieves a room by its ID.
func (sm *SafeRoomsMap) Get(key string) (value *Room, ok bool) {
	sm.RLock()
	defer sm.RUnlock()
	value, ok = sm.items[key]
	return value, ok
}

// Len returns the number of rooms in the hub.
func (sm *SafeRoomsMap) Len() int {
	sm.RLock()
	defer sm.RUnlock()
	return len(sm.items)
}

// Delete removes a room from SafeRoomsMap.
func (sm *SafeRoomsMap) Delete(key string) {
	sm.Lock()
	defer sm.Unlock()
	delete(sm.items, key)
}

// RRange iterates over all rooms in the hub, applying a given function.
func (sm *SafeRoomsMap) RRange(act func(key string, value *Room)) {
	sm.RLock()
	defer sm.RUnlock()
	for key, value := range sm.items {
		act(key, value)
	}
}

// NewRoom creates a new room and registers it in the hub.
func NewRoom(hub *Hub, ID string) (*Room, bool) {
	room := createRoom(hub, ID)

	hub.RegisterRoomToHub(room)
	// Wait for room registration confirmation
	ok := <-room.Registered
	return room, ok
}

// createRoom initializes a new Room instance without registering it.
func createRoom(hub *Hub, ID string) *Room {
	return &Room{
		ID:         ID,
		Clients:    NewSafeClientsMap(),
		Registered: make(chan bool),
	}
}

// isThereClient checks if a given client exists in the room.
func (r *Room) isThereClient(client *Client) bool {
	_, ok := r.Clients.Get(client.UserName)
	return ok
}

// DeleteClient removes a client from the room.
func (r *Room) DeleteClient(client *Client) {
	if r.isThereClient(client) {
		r.Clients.Delete(client.UserName)
	}
}

// GetUsersInRoom returns a list of all users in the room.
func (r *Room) GetUsersInRoom() []ClientUser {
	r.Clients.RLock()
	defer r.Clients.RUnlock()

	users := make([]ClientUser, len(r.Clients.items))
	i := 0
	for _, client := range r.Clients.items {
		users[i] = client.ClientUser
		i++
	}
	return users
}

// Size returns the number of users in the room.
func (r *Room) Size() int {
	return r.Clients.Len()
}

// ContainsUser checks if a user with the given username exists in the room.
func (r *Room) ContainsUser(UserName string) bool {
	r.Clients.RLock()
	defer r.Clients.RUnlock()

	for _, client := range r.Clients.items {
		if client.UserName == UserName {
			return true
		}
	}
	return false
}

// String returns a string representation of the room.
func (r *Room) String() string {
	return fmt.Sprintf("id: %s", r.ID)
}
