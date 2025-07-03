// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"encoding/json"
	"math"
	"time"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/game"
)

func welcomeUser(client *Client, currentGame *game.Game) {

	msg := game.GenerateUpdateUserStatsMessage(client.user.Streak, client.user.Score)
	msgStr, err := json.Marshal(msg)
	if err != nil {
		println("Error marshalling user stats message:", err)
		return
	}

	sendMessageToClient(client, msgStr)

	currentTime := time.Now().UnixMilli()

	questionMessage := currentGame.GenerateQuestionMessage()
	questionMessageStr, err := json.Marshal(questionMessage)
	if err != nil {
		println("Error marshalling question message:", err)
		return
	}
	sendMessageToClient(client, questionMessageStr)

	if currentTime < currentGame.QuestionPreviewDeadline {
		return
	}

	answerPhaseMessage := currentGame.GenerateAnswerPhaseMessage()
	answerPhaseMessageStr, err := json.Marshal(answerPhaseMessage)
	if err != nil {
		println("Error marshalling answer phase message:", err)
		return
	}
	sendMessageToClient(client, answerPhaseMessageStr)

	if currentTime < currentGame.QuestionSubmissionDeadline {
		return
	}

	showAnswerMessage := currentGame.GenerateShowAnswerMessage()
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
			case "hello":
				welcomeUser(message.Client, currentGame)
			case "select-answer":
				answer, ok := msg["answer"].(float64)
				if !ok {
					println("Invalid answer format")
					continue
				}

				message.Client.selectedAnswer = int(answer)
			default:
				println("Unknown message type:", messageType)
			}

		case event := <-currentGame.Listen:
			eventStr, err := json.Marshal(event)
			if err != nil {
				println("Error marshalling event:", err)
				continue
			}

			switch event.Type {
			case game.AnswerPhaseEventType:
				{
					for client := range h.clients {
						client.selectedAnswer = -1
					}
				}
			case game.ShowAnswerEventType:
				{
					var updatedUsers []*db.User

					for client := range h.clients {
						// if the streak is 0 and the client has not selected an answer, nothing will happen, so continue
						if client.user.Streak == 0 && client.selectedAnswer == -1 {
							continue
						}

						if client.selectedAnswer == currentGame.CurrentQuestion.Correct {
							client.user.Score += int(math.Round(math.Pow(game.BASE_SCORE_INCREMENT, 1+game.SCORE_EXPONENT_INCREMENT*float64(client.user.Streak))))
							client.user.Streak++

						} else {
							client.user.Streak = 0
						}

						msg := game.GenerateUpdateUserStatsMessage(client.user.Streak, client.user.Score)
						msgStr, err := json.Marshal(msg)
						if err != nil {
							println("Error marshalling user stats message:", err)
							continue
						}

						sendMessageToClient(client, msgStr)

						if client.user.ID != "" {
							updatedUsers = append(updatedUsers, client.user)
						}
					}

					// Update the users in the database
					db.UpdateManyUsers(updatedUsers)
				}
			}

			// Broadcast the event to all connected clients
			for client := range h.clients {
				sendMessageToClient(client, eventStr)
			}
		}
	}
}
