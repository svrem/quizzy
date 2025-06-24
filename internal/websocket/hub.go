// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"encoding/json"
	"time"

	"github.com/svrem/qizzy/internal/game"
)

func welcomeUser(client *Client, game *game.Game) {
	currentTime := time.Now().UnixMilli()

	questionMessage := game.GenerateQuestionMessage()
	questionMessageStr, err := json.Marshal(questionMessage)
	if err != nil {
		println("Error marshalling question message:", err)
		return
	}
	sendMessageToClient(client, questionMessageStr)

	if currentTime < game.QuestionPreviewDeadline {
		return
	}

	answerPhaseMessage := game.GenerateAnswerPhaseMessage()
	answerPhaseMessageStr, err := json.Marshal(answerPhaseMessage)
	if err != nil {
		println("Error marshalling answer phase message:", err)
		return
	}
	sendMessageToClient(client, answerPhaseMessageStr)

	if currentTime < game.QuestionSubmissionDeadline {
		return
	}

	showAnswerMessage := game.GenerateShowAnswerMessage()
	showAnswerMessageStr, err := json.Marshal(showAnswerMessage)
	if err != nil {
		println("Error marshalling show answer message:", err)
		return
	}
	sendMessageToClient(client, showAnswerMessageStr)

}

func sendMessageToClient(client *Client, message []byte) {
	select {
	case client.send <- message:
	default:
		close(client.send)
		delete(client.hub.clients, client)
	}
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Register requests from the clients.
	register chan *Client

	// Channel for handling messages from clients.
	handleMessage chan Message

	// Unregister requests from clients.
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		handleMessage: make(chan Message),
		clients:       make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	currentGame := game.NewGame()
	go currentGame.Start()

	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.handleMessage:
			var msg map[string]interface{}
			if err := json.Unmarshal(message.Data, &msg); err != nil {
				println("Error unmarshalling message:", err.Error())
				continue
			}

			messageType, ok := msg["type"].(string)

			if !ok {
				println("Invalid message type")
				continue
			}

			switch messageType {
			case "welcome":
				welcomeUser(message.Client, currentGame)
			default:
				println("Unknown message type:", messageType)
			}

		case event := <-currentGame.Listen:
			eventStr, err := json.Marshal(event)
			if err != nil {
				println("Error marshalling event:", err)
				continue
			}

			for client := range h.clients {
				sendMessageToClient(client, eventStr)
			}
		}
	}
}
