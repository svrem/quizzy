package routes

import (
	"net/http"

	"github.com/svrem/quizzy/internal/auth"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./website/build")))

	auth.RegisterRoutes(mux)

	return mux
}
