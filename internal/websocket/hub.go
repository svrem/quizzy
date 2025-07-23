// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/protocol"
)

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

	// Current game instance.
	currentGame *game.Game
}

func NewHub(currentGame *game.Game) *Hub {
	return &Hub{
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		handleMessage: make(chan Message, 1000),
		clients:       make(map[*Client]bool),
		currentGame:   currentGame,
	}
}

func (h *Hub) Run() {
	gameChan := make(chan *protocol.GameEvent)
	h.currentGame.Broadcaster.Register <- gameChan

	defer func() {
		h.currentGame.Broadcaster.Unregister <- gameChan
		close(gameChan)
	}()

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
			h.handleUserMessage(message)

		case event := <-gameChan:
			h.handleGameEvent(event)

		}
	}
}
