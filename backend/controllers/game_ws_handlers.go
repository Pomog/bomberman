package controllers

import (
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/server"
	"github.com/Pomog/bomberman/backend/webmodel"
)

/*
ReadyToStart handles a WebSocket request when a player is ready to start the game.
If the player is in the waiting room, it clears the waiting room state.
*/
func ReadyToStart(app *server.Application) wsconnection.FuncReplier {
	return func(currConnection *wsconnection.UsersConnection, wsMessage webmodel.WSMessage) error {
		// If the player is in the waiting room, clear it to indicate the game can start
		if app.WaitingRoom != nil && app.WaitingRoom.ID == currConnection.Client.Room.ID {
			app.WaitingRoom = nil
		}
		return nil
	}
}

/*
ReplyStartGame sends the GameMap string to the frontend.
The GameMap string is used by the frontend to generate the game map.
*/
func ReplyStartGame(app *server.Application) wsconnection.FuncReplyCreator {
	return func(currConnection *wsconnection.UsersConnection, message webmodel.WSMessage) (any, error) {
		// If the player's room is in the waiting room, clear it
		if app.WaitingRoom != nil && app.WaitingRoom.ID == currConnection.Client.Room.ID {
			app.WaitingRoom = nil
		}
		// Send the GameMap to the client so they can render the game
		return currConnection.Client.Room.GameMap, nil
	}
}

/*
ReplyPlayerAction broadcasts a player's action to all other players in the same room.
*/
func ReplyPlayerAction(app *server.Application) wsconnection.FuncReplier {
	return func(currConnection *wsconnection.UsersConnection, message webmodel.WSMessage) error {
		// Create a player action object containing the username and action payload
		playerAction := webmodel.PlrAction{
			UserName: currConnection.Client.UserName,
			Action:   message.Payload,
		}

		// Broadcast the action to all clients in the same room
		_, _, err := currConnection.SendMessageToClientRoom(webmodel.PlayerAction, playerAction)
		if err != nil {
			return currConnection.WSError("sending action to client room failed", err)
		}
		return nil
	}
}
