package server

import (
	"github.com/Pomog/bomberman/backend/logger"
	"github.com/Pomog/bomberman/backend/websocket_hub"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// Application represents the main backend server structure
// It manages logging, WebSocket hub, HTTP server, and connection upgrades.
type Application struct {
	ErrLog      *log.Logger         // Logger for errors
	InfoLog     *log.Logger         // Logger for general info
	Hub         *websocket_hub.Hub  // Manages WebSocket connections
	WaitingRoom *websocket_hub.Room // A temporary room for waiting players
	Upgrader    websocket.Upgrader  // Handles WebSocket upgrades
	Server      *http.Server        // HTTP server instance
}

// New initializes and returns a new Application instance.
// It sets up logging, WebSocket handling, and the HTTP server.
func New(serverAddress string) *Application {
	application := &Application{}

	// Create loggers for error and info messages
	application.ErrLog, application.InfoLog = logger.CreateLoggers()

	// Initialize WebSocket hub
	application.Hub = websocket_hub.NewHub()

	// Configure WebSocket upgrader
	application.Upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			// Allow WebSocket connections only from localhost
			origin := r.Header.Get("Origin")
			return origin == "http://localhost:8080" ||
				origin == "http://127.0.0.1:8080" ||
				origin == "http://www.localhost:8080" ||
				origin == "http://www.127.0.0.1:8080"
			// return true // Uncomment to allow all origins (not recommended)
		},
	}

	// Create the HTTP server with timeouts and logging
	application.Server = &http.Server{
		Addr:         serverAddress,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  15 * time.Second,
		ErrorLog:     application.ErrLog, // Attach error logger to server
	}

	return application
}
