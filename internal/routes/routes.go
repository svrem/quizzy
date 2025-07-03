package routes

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/svrem/quizzy/internal/auth"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	auth.RegisterRoutes(mux)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		filePath := filepath.Join("./website/build", r.URL.Path)

		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			http.ServeFile(w, r, filePath)
			return
		}
		http.ServeFile(w, r, "./website/build/index.html")
	})

	return mux
}
