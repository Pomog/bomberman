package routes

import (
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/controllers"
	"github.com/Pomog/bomberman/backend/server"
	"github.com/Pomog/bomberman/backend/webmodel"
)

// CreateChatWsRoutes initializes WebSocket routes for the chat system and game-related interactions.
// It sets up handlers for different WebSocket message types and returns a WebSocket server configuration.
func CreateChatWsRoutes(app *server.Application) wsconnection.WSmux {
	// wsconnection.WSmux is a struct that acts as a multiplexer (router) for WebSocket events.
	// It maintains logs, a hub for managing connections, and a map of message handlers.
	wsServer := wsconnection.WSmux{
		InfoLog: app.InfoLog, // Logger for informational messages
		ErrLog:  app.ErrLog,  // Logger for errors
		Hub:     app.Hub,     // WebSocket hub managing connected clients
	}

	// WShandlers maps WebSocket event types (from `webmodel`) to their corresponding handler functions.
	// Each handler is responsible for processing a specific type of WebSocket message.
	wsServer.WShandlers = map[string]wsconnection.Replier{
		webmodel.SendMessageToChat: controllers.ReplySendMessageToChat(app),                  // Handles chat messages between players
		webmodel.PlayerAction:      controllers.ReplyPlayerAction(app),                       // Processes player movement or game-related actions
		webmodel.StartGame:         controllers.ReplyStartGame(app),                          // Handles game start requests
		webmodel.ReadyToStart:      controllers.ReadyToStart(app),                            // Marks a player as ready to begin
		webmodel.UserQuitChat:      controllers.SendUserToRoomMembers(webmodel.UserQuitChat), // Handles user disconnection from the chat
	}

	// TODO: Implement handling for "gameOver" WebSocket message.
	// The frontend should send a "gameOver" event when a match ends.
	// On receiving this event, the server should:
	// - Close the WebSocket connection for the client.
	// - Unregister the client and remove them from their room.
	// - Possibly notify other players in the room.

	return wsServer
}
