// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"encoding/json"

	"github.com/svrem/qizzy/internal/game"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func sendMessageToClient(client *Client, message []byte) {
	select {
	case client.send <- message:
	default:
		close(client.send)
		delete(client.hub.clients, client)
	}
}

func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	curr_game := game.NewGame()
	go curr_game.Start()

	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

			welcomeMessage := curr_game.GenerateWelcomeMessage()
			welcomeMessageStr, err := json.Marshal(welcomeMessage)

			if err != nil {
				println("Error marshalling welcome message:", err)
				continue
			}

			sendMessageToClient(client, welcomeMessageStr)

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case event := <-curr_game.Listen:
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
