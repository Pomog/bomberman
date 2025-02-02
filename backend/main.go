package main

import (
	"fmt"
	"github.com/Pomog/bomberman/backend/routes"
	"github.com/Pomog/bomberman/backend/server"
	"log"
	"net/http"
)

var port = "8000" // The server will run on port 8000. This could be changed in the future, potentially by environment variables.

// The main function is the entry point of the application.
// It sets up the logger, initializes the application, sets up routes, and starts the server.
func main() {
	// Configure logging to include timestamp and source file details
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Create the application instance with the given address (localhost:8000)
	addr := fmt.Sprintf(":%s", port)
	app := server.New(addr)

	// Error handling: If app creation fails, terminate the program and log the error
	if app == nil {
		log.Fatalln("Failed to initialize application")
	}

	// Create WebSocket routes for chat functionality
	wsHandlers := routes.CreateChatWsRoutes(app)

	// Create a new HTTP request multiplexer (mux) to handle incoming requests
	mux := http.NewServeMux()

	// Set up the server handler with the routes (API and WebSocket)
	app.Server.Handler = routes.CreateAPIroutes(mux, app, wsHandlers)

	// Start the chat hub in a separate goroutine to handle real-time messaging
	go app.Hub.Run()
	app.InfoLog.Println("The chat Hub is running...")

	// Log that the server is running and the port it's listening on
	log.Println("main: running server on port", port)

	// Start the server and listen for incoming requests.
	// If an error occurs while starting the server, log it and terminate the program
	if err := app.Server.ListenAndServe(); err != nil {
		app.ErrLog.Fatalf("main: couldn't start server: %v\n", err)
	}
}
