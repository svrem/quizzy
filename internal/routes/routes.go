package routes

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"

	"github.com/svrem/quizzy/internal/auth"
	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/users"
)

func NewRouter() *http.ServeMux {
	isDev := os.Getenv("ENV") == "development"

	mux := http.NewServeMux()

	auth.RegisterRoutes(mux)
	game.RegisterRoutes(mux)
	users.RegisterRoutes(mux)

	mux.HandleFunc("/api/time", timeSyncHandler)

	if isDev {
		target, _ := url.Parse("http://localhost:3000")
		proxy := httputil.NewSingleHostReverseProxy(target)

		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			r.Host = target.Host
			r.URL.Scheme = target.Scheme
			r.URL.Host = target.Host
			proxy.ServeHTTP(w, r)
		})
		return mux
	} else {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			filePath := filepath.Join("./website/build", r.URL.Path)

			if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
				http.ServeFile(w, r, filePath)
				return
			}
			http.ServeFile(w, r, "./website/build/index.html")
		})
	}

	return mux
}
