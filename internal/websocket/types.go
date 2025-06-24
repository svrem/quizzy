package websocket

type Message struct {
	Client *Client
	Data   []byte
}
