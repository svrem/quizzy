package game

import "github.com/svrem/quizzy/internal/protocol"

// Fan-out broadcaster
type Broadcaster struct {
	broadcast  chan *protocol.GameEvent
	outputs    []chan *protocol.GameEvent
	Register   chan chan *protocol.GameEvent
	Unregister chan chan *protocol.GameEvent
}

func NewBroadcaster() *Broadcaster {
	b := &Broadcaster{
		broadcast:  make(chan *protocol.GameEvent),
		outputs:    make([]chan *protocol.GameEvent, 0),
		Register:   make(chan chan *protocol.GameEvent),
		Unregister: make(chan chan *protocol.GameEvent),
	}

	go b.run()
	return b
}

func (b *Broadcaster) run() {
	for {
		select {
		case msg := <-b.broadcast:
			for _, ch := range b.outputs {
				select {
				case ch <- msg:
				default:
					// Skip if full or slow reader
				}
			}
		case newCh := <-b.Register:
			b.outputs = append(b.outputs, newCh)
		case deadCh := <-b.Unregister:
			for i, ch := range b.outputs {
				if ch == deadCh {
					b.outputs = append(b.outputs[:i], b.outputs[i+1:]...)
					break
				}
			}
		}
	}
}
