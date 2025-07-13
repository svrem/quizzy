// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"math"
	"time"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/protocol"
	"google.golang.org/protobuf/proto"
)

func welcomeUser(client *Client, currentGame *game.Game) {
	currentTime := time.Now().UnixMilli()

	if len(currentGame.SelectedCategories) != 0 {
		questionMessage := currentGame.GenerateCategorySelectionMessage()
		questionMessageStr, err := proto.Marshal(questionMessage)
		if err != nil {
			println("Error marshalling category selection message:", err)
			return
		}
		sendMessageToClient(client, questionMessageStr)

		if currentTime < currentGame.CategorySelectionDeadline {
			return
		}

		questionMessage = currentGame.GenerateCategoryVotesMessage()
		questionMessageStr, err = proto.Marshal(questionMessage)
		if err != nil {
			println("Error marshalling category votes message:", err)
			return
		}
		sendMessageToClient(client, questionMessageStr)

		return
	}

	if currentGame.CurrentQuestion == nil {
		return
	}

	questionMessage := currentGame.GenerateQuestionMessage()
	questionMessageStr, err := proto.Marshal(questionMessage)
	if err != nil {
		println("Error marshalling question message:", err)
		return
	}
	sendMessageToClient(client, questionMessageStr)

	if currentTime < currentGame.QuestionPreviewDeadline {
		return
	}

	answerPhaseMessage := currentGame.GenerateAnswerPhaseMessage()
	answerPhaseMessageStr, err := proto.Marshal(answerPhaseMessage)
	if err != nil {
		println("Error marshalling answer phase message:", err)
		return
	}
	sendMessageToClient(client, answerPhaseMessageStr)

	if currentTime < currentGame.QuestionSubmissionDeadline {
		return
	}

	showAnswerMessage := currentGame.GenerateShowAnswerMessage()
	showAnswerMessageStr, err := proto.Marshal(showAnswerMessage)
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
			var userEvent protocol.UserEvent
			if err := proto.Unmarshal(message.Data, &userEvent); err != nil {
				println("Error unmarshalling user event:", err)
				continue
			}

			switch userEvent.Type {
			case protocol.UserEventType_HELLO:
				welcomeUser(message.Client, currentGame)
			case protocol.UserEventType_SELECT_ANSWER:

				answerIndex := userEvent.GetSelectAnswer().AnswerIndex

				if message.Client.selectedAnswer != -1 {
					currentGame.QuestionVotes[message.Client.selectedAnswer]--
				}

				message.Client.selectedAnswer = answerIndex
				currentGame.QuestionVotes[answerIndex]++
			case protocol.UserEventType_SELECT_CATEGORY:

				categoryIndex := userEvent.GetSelectCategory().CategoryIndex

				if message.Client.selectedCategory != -1 {
					currentGame.CategoryVotes[message.Client.selectedCategory]--
				}

				message.Client.selectedCategory = categoryIndex
				currentGame.CategoryVotes[categoryIndex]++
			default:
				println("Unknown message type:", userEvent.Type)
			}

		case event := <-currentGame.Listen:
			eventStr, err := proto.Marshal(event)
			if err != nil {
				println("Error marshalling event:", err)
				continue
			}

			switch event.Type {
			case protocol.GameEventType_QUESTION:
				{
					for client := range h.clients {
						client.selectedAnswer = -1
					}
				}
			case protocol.GameEventType_CATEGORY_VOTES:
				{
					for client := range h.clients {
						client.selectedCategory = -1
					}

				}
			case protocol.GameEventType_SHOW_ANSWER:
				{
					var updatedUsers []*db.User

					for client := range h.clients {
						// if the streak is 0 and the client has not selected an answer, nothing will happen, so continue
						if client.user.Streak == 0 && client.selectedAnswer == -1 {
							continue
						}

						if client.selectedAnswer == currentGame.CurrentQuestion.Correct {
							client.user.Score += int(math.Round(math.Pow(game.BaseScoreIncrement, 1+game.ScoreExponentIncrement*float64(client.user.Streak))))
							client.user.Streak++

							if client.user.Streak > client.user.MaxStreak {
								client.user.MaxStreak = client.user.Streak
							}

						} else {
							client.user.Streak = 0
						}

						msg := game.GenerateUpdateUserStatsMessage(client.user.Streak, client.user.Score)
						msgStr, err := proto.Marshal(msg)
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
