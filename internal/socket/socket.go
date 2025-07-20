package socket

import (
	"log"
	"net"
	"os"
	"time"

	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/protocol"
	"google.golang.org/protobuf/proto"
)

type Socket struct {
	currentGame *game.Game
}

func (s *Socket) Run() {
	gameChan := make(chan *protocol.GameEvent)
	s.currentGame.Broadcaster.Register <- gameChan

	defer func() {
		s.currentGame.Broadcaster.Unregister <- gameChan
		close(gameChan)
	}()

	listen, err := net.Listen("tcp", ":3001")
	if err != nil {
		println("Error starting TCP listener:", err)
		return
	}
	defer listen.Close()

	for {
		conn, err := listen.Accept()

		if err != nil {
			println("Error accepting connection:", err)
			continue
		}

		go s.handleConnection(conn, gameChan)
	}
}

func (s *Socket) handleConnection(conn net.Conn, gameChan chan *protocol.GameEvent) {
	defer conn.Close()

	conn.SetDeadline(time.Now().Add(30 * time.Second)) // Set initial timeout

	recv := make([]byte, 1024)
	n, err := conn.Read(recv)

	if err != nil {
		log.Println("Error reading from connection:", err)
		return
	}

	if string(recv[:n]) != os.Getenv("SOCKET_SECRET") {
		log.Println("Invalid connection request")
		return
	}

	for event := range gameChan {
		// Reset deadline before each write operation
		if err := conn.SetDeadline(time.Now().Add(30 * time.Second)); err != nil {
			log.Println("Error setting deadline:", err)
			return
		}

		eventStr, err := proto.Marshal(event)
		if err != nil {
			log.Println("Error marshalling event:", err)
			continue
		}

		_, err = conn.Write(eventStr)
		if err != nil {
			log.Println("Error writing to connection:", err)
			return
		}
	}
}

func NewSocket(currentGame *game.Game) *Socket {
	return &Socket{
		currentGame: currentGame,
	}
}
