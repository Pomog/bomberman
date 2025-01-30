package wsconnection

import (
	"errors"
	"github.com/Pomog/bomberman/backend/helpers"
	"github.com/Pomog/bomberman/backend/webmodel"
	"io"
	"time"

	"github.com/gorilla/websocket"
)

// Constants for WebSocket connection settings like message size, ping period, and write deadlines.
const (
	writeWait      = 10 * time.Second    // Time allowed to write a message to the peer.
	pongWait       = 60 * time.Second    // Time allowed to read the next pong message from the peer.
	pingPeriod     = (pongWait * 9) / 10 // Send pings to peer with this period. Must be less than pongWait.
	maxMessageSize = 4096                // Maximum message size allowed from peer.
)

var NewLine = []byte("\n") // Used for separating messages.

// ReadPump handles reading messages from the WebSocket connection in a separate goroutine.
// It receives messages, processes them, and handles any errors that may occur, such as unexpected disconnections.
func (uc *UsersConnection) ReadPump() {
	defer func() {
		// Clean up when the connection is closed.
		err := uc.deleteClientAndSendUserOffline()
		if err != nil {
			uc.WsServer.ErrLog.Printf("ReadPump: error client delete: %v", err)
		}

		close(uc.Client.ReceivedMessages)
		err = uc.Client.Conn.Close()
		uc.WsServer.InfoLog.Printf("ReadPump closed connection %p because: %s", uc.Client.Conn, err)
	}()

	// Set connection limits and deadlines for reading messages.
	uc.Client.Conn.SetReadLimit(maxMessageSize)
	uc.Client.Conn.SetReadDeadline(time.Now().Add(pongWait))

	// Set pong handler to reset the read deadline upon receiving a pong message.
	uc.Client.Conn.SetPongHandler(func(string) error {
		uc.Client.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		var message webmodel.WSMessage
		err := uc.Client.Conn.ReadJSON(&message)
		uc.WsServer.InfoLog.Printf("Message received from js: %s\n ", message)

		if err != nil {
			// Handle unexpected connection closures.
			if websocket.IsUnexpectedCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				uc.WsServer.ErrLog.Printf("websocket connection %p to '%s' was unexpectedly closed: %#v", uc.Client.Conn, uc.Client.Conn.LocalAddr(), err)
			}
			uc.WsServer.InfoLog.Printf("ReadPump is closing connection %p  of client  '%s' : %#v", uc.Client.Conn, uc.Client, err)
			break
		}

		// Find the appropriate message handler for the message type.
		replier, ok := uc.WsServer.WShandlers[message.Type]
		if !ok {
			uc.WsServer.ErrLog.Printf("unknown type message received: %s", message.Type)
			continue
		}

		// Send the response to the message.
		err = replier.SendReply(uc, message)
		if err != nil && !errors.Is(err, webmodel.ErrWarning) {
			break
		}
	}
}

// WritePump handles sending messages to the WebSocket connection in a separate goroutine.
// It writes messages from the hub to the client and sends periodic pings to keep the connection alive.
func (uc *UsersConnection) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		err := uc.Client.Conn.Close()
		if err != nil {
			uc.WsServer.InfoLog.Printf("WritePump: error closing connection: %v", err)
		} else {
			uc.WsServer.InfoLog.Printf("WritePump closed connection %p because %s", uc.Client.Conn, err)
		}
	}()
	for {
		chann := uc.Client.ReceivedMessages
		select {
		case message, ok := <-chann:
			uc.WsServer.InfoLog.Printf("write message %s\n", message)
			if !ok {
				// The hub closed the channel, so close the connection.
				uc.Client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				uc.WsServer.InfoLog.Printf("WritePump is closing connection because the hub closed the channel %p ", chann)
				return
			}

			// Set write deadline and begin sending the message.
			uc.Client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			w, err := uc.Client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				uc.WsServer.ErrLog.Printf("cannot create the NextWriter on the connection %p : %v", uc.Client.Conn, err)
				return
			}
			uc.writeMessage(w, message)

			// Write any additional messages queued in the channel.
			n := len(chann)
			for i := 0; i < n; i++ {
				message = <-chann
				uc.writeMessage(w, message)
			}

			// Close the writer after sending all the messages.
			if err := w.Close(); err != nil {
				uc.WsServer.ErrLog.Printf("cannot close the writer on the connection %p : %v", uc.Client.Conn, err)
				return
			}
		case <-ticker.C:
			// Send periodic ping messages to keep the connection alive.
			uc.Client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := uc.Client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				uc.WsServer.ErrLog.Printf("ping the connection %s failed: %v", uc.Client.Conn.LocalAddr(), err)
				return
			}
		}
	}
}

// writeMessage writes a message to the WebSocket connection.
func (uc *UsersConnection) writeMessage(w io.WriteCloser, message []byte) error {
	_, err := w.Write(message)
	if err != nil {
		return err
	}
	uc.WsServer.InfoLog.Printf("Websocket: send message: '%s' to client %s", helpers.ShortMessage(message), uc.Client)
	_, err = w.Write(NewLine) // Write a newline after each message.
	if err != nil {
		return err
	}
	return nil
}

// deleteClientAndSendUserOffline handles removing a client from the server's hub and notifying the system that the user has gone offline.
func (uc *UsersConnection) deleteClientAndSendUserOffline() error {
	uc.WsServer.Hub.UnRegisterClientFromHub(uc.Client)
	if uc.Client.UserName != "" {
		// Send user quit message to inform the system.
		err := uc.WsServer.WShandlers[webmodel.UserQuitChat].SendReply(uc, webmodel.WSMessage{Type: webmodel.UserQuitChat, Payload: nil})
		return err
	}
	return nil
}
