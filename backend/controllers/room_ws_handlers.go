package controllers

import (
	"errors"
	"fmt"
	wsconnection "github.com/Pomog/bomberman/backend/connection"
	"github.com/Pomog/bomberman/backend/server"
	"github.com/Pomog/bomberman/backend/webmodel"
)

/*
SendListOfUsersInRoom sends the list of users in the room to the newly joined user.
It also notifies the other users in the room about the new player's arrival.
*/
func SendListOfUsersInRoom(app *server.Application, currConnection *wsconnection.UsersConnection) error {
	// Send the list of current users in the room to the new user
	err := sendListOfUsersInRoomToCurrentUser(app, currConnection)
	if err != nil && !errors.Is(err, webmodel.ErrWarning) {
		return currConnection.WSError(fmt.Sprintf(
			"sending list of users in the room '%s' to the user %s failed",
			currConnection.Client.Room.ID, currConnection.Client.UserName), err)
	}

	// Notify all room members about the new user joining
	err = SendUserToRoomMembers(webmodel.RegisterNewPlayer)(currConnection, webmodel.WSMessage{})
	if err != nil {
		return errors.Join(webmodel.ErrWarning, err)
	}

	return nil
}

/*
sendListOfUsersInRoomToCurrentUser sends the list of users in the room
to the newly joined user.
*/
func sendListOfUsersInRoomToCurrentUser(app *server.Application, currConnection *wsconnection.UsersConnection) error {
	// Retrieve the list of users in the room
	users := currConnection.Client.Room.GetUsersInRoom()

	// Send the list to the new user
	_, err := currConnection.SendSuccessMessage(webmodel.UsersInRoom, users)
	return err
}

/*
SendUserToRoomMembers notifies all users in the chat room about a change in user status.
It can be used for both joining and leaving events.
*/
func SendUserToRoomMembers(statusType string) wsconnection.FuncReplier {
	return func(currConnection *wsconnection.UsersConnection, wsMessage webmodel.WSMessage) error {
		// Broadcast the user status update to all members in the chat room
		_, _, err := currConnection.SendMessageToClientRoom(statusType, currConnection.Client.ClientUser)
		return err
	}
}
