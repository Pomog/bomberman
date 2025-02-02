package routes

import (
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/handlers"
	"github.com/Pomog/bomberman/backend/server"
	"net/http"
)

// CreateAPIroutes sets up the HTTP routes for the application and returns the modified ServeMux.
// It registers routes for joining games and WebSocket handlers.
func CreateAPIroutes(mux *http.ServeMux, app *server.Application, wsHandlers wsconnection.WSmux) *http.ServeMux {
	// Register the health check route
	mux.Handle("/health", handlers.HealthCheck(app))

	// Register a route for joining a game, where the JoinGame handler
	// manages WebSocket connections for the game
	mux.Handle(handlers.JOIN_GAME_URL, handlers.JoinGame(app, wsHandlers))

	// Return the updated mux with the new route added
	return mux
}
