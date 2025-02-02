package handlers

import (
	"errors"
	"fmt"
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/controllers"
	"github.com/Pomog/bomberman/backend/errorhandle"
	"github.com/Pomog/bomberman/backend/helpers"
	"github.com/Pomog/bomberman/backend/mapgen"
	"github.com/Pomog/bomberman/backend/server"
	"github.com/Pomog/bomberman/backend/webmodel"
	"github.com/Pomog/bomberman/backend/websocket_hub"
	"github.com/gorilla/websocket"
	"net/http"
	"net/url"
)

// JOIN_GAME_URL URL path for joining the game
const (
	JOIN_GAME_URL = "/joinGame"
)

// MAX_ROOM_SIZE Maximum number of players allowed in a room
const MAX_ROOM_SIZE = 4

// Err_Duplicate_User Error message for duplicate usernames
var Err_Duplicate_User = errors.New("duplicate user name")

// Context key type to store user session
type contestKey string

const CTX_USER = contestKey("userSession")

/*
logErrorAndCloseConn logs an error and closes the WebSocket connection.

Params:
- app: Application instance for logging errors
- conn: WebSocket connection to be closed
- errMessage: Error message string
- err: Actual error that occurred
*/
func logErrorAndCloseConn(app *server.Application, conn *websocket.Conn, errMessage string, err error) {
	app.ErrLog.Printf("%s: %v", errMessage, err)

	err = conn.Close()
	if err != nil {
		app.ErrLog.Printf("error closing connection: %v", err)
	}
}

/*
JoinGame handles WebSocket requests for users joining a game.
It extracts the username from the request, creates a waiting room if necessary,
establishes a WebSocket connection, and registers the user.

Returns an HTTP handler function.
*/
func JoinGame(app *server.Application, wsReplyersSet wsconnection.WSmux) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set required headers for CORS
		w.Header().Add("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Access-Control-Allow-Headers", "*")
		w.Header().Add("Access-Control-Allow-Origin", "http://localhost:8080")

		var err error

		// Extract username from the request URL
		userName, err := getChatParams(r.URL)
		if err != nil {
			errorhandle.BadRequestError(app, w, r, err.Error())
			return
		}

		// Create a waiting room if none exists
		if app.WaitingRoom == nil {
			app.WaitingRoom, err = createRoom(app.Hub)
			if err != nil {
				errorhandle.BadRequestError(app, w, r, err.Error())
				return
			}
			app.InfoLog.Printf("WaitingRoom created, id: %s", app.WaitingRoom)
		}

		// Upgrade HTTP connection to WebSocket
		conn, err := app.Upgrader.Upgrade(w, r, nil)
		if err != nil {
			errorhandle.ServerError(app, w, r, "Upgrade failed:", err)
			return
		}

		app.InfoLog.Printf("Connection %p to '%s' upgraded to WebSocket protocol", conn, r.URL.Path)

		// Create a user connection and validate uniqueness
		currentConnection, err := createClient(app, userName, conn, wsReplyersSet)
		if err == Err_Duplicate_User {
			// Send error message to the client if username is duplicate
			wsMessage, err1 := webmodel.CreateJSONMessage(webmodel.UsersInRoom, webmodel.ERROR_RESULT, err.Error())
			if err1 != nil {
				conn.Close()
				errorhandle.ServerError(app, w, r, "Cannot create a client:", err)
				return
			}
			conn.WriteMessage(websocket.TextMessage, wsMessage)
			conn.Close()
			errorhandle.BadRequestError(app, w, r, err.Error())
			return
		}

		if err != nil {
			conn.Close()
			errorhandle.ServerError(app, w, r, "Cannot create a client:", err)
			return
		}

		// Start reading and writing pumps for WebSocket communication
		go currentConnection.WritePump()
		go currentConnection.ReadPump()

		// Send the list of current users in the room to the new user
		err = controllers.SendListOfUsersInRoom(app, currentConnection)
		if err != nil && !errors.Is(err, webmodel.ErrWarning) {
			logErrorAndCloseConn(app, conn, "Sending users in room failed", err)
			return
		}

		app.InfoLog.Printf("User '%s' joined room '%s'", userName, currentConnection.Client.Room)
	}
}

/*
getChatParams extracts the username from the request URL.

Expected format: "/joinRoom?name=<userName>"

Returns:
- userName: Extracted username
- err: Error if the username is missing
*/
func getChatParams(url *url.URL) (userName string, err error) {
	userName = url.Query().Get("name")
	if userName == "" {
		err = fmt.Errorf("no name specified")
	}
	return
}

/*
createRoom initializes a new game room in the hub.

Returns:
- *wshub.Room: Pointer to the created room
- error: Error if room creation fails
*/
func createRoom(hub *websocket_hub.Hub) (*websocket_hub.Room, error) {
	var roomID string

	// Generate a unique ID for the room
	roomID, err := helpers.GenerateNewUUID()
	if err != nil {
		return nil, fmt.Errorf("Cannot generate UUID for new room: %v", err)
	}

	// Create a new room in the hub
	waitingRoom, ok := websocket_hub.NewRoom(hub, roomID)
	if !ok {
		return nil, fmt.Errorf("Room with ID '%s' was already created, try again", roomID)
	}

	// Assign a randomly generated game map
	waitingRoom.GameMap = mapgen.DefaultRandomMapGenerator()

	return waitingRoom, nil
}

/*
createClient creates a new user connection and assigns them to the waiting room.

Returns:
- *wsconnection.UsersConnection: Created WebSocket connection
- error: Error if user already exists or creation fails
*/
func createClient(app *server.Application, userName string, conn *websocket.Conn, wsReplyersSet wsconnection.WSmux) (*wsconnection.UsersConnection, error) {
	// Check if user already exists in the room
	if app.WaitingRoom.ContainsUser(userName) {
		return nil, Err_Duplicate_User
	}

	// Create a new client in the WebSocket hub
	client, err := websocket_hub.NewClient(app.Hub, userName, app.WaitingRoom, conn, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("createClient:: NewClient failed: %v", err)
	}

	// Reset the waiting room if it reaches the maximum size
	if app.WaitingRoom.Size() == MAX_ROOM_SIZE {
		app.WaitingRoom = nil
	}

	app.InfoLog.Printf("New client in room '%s' is created: %s", app.WaitingRoom, client)

	// Return the WebSocket user connection
	return &wsconnection.UsersConnection{
		Client:   client,
		WsServer: wsReplyersSet,
	}, nil
}
