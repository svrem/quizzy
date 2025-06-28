package routes

import "net/http"

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./website/build")))

	return mux
}
