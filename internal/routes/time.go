package routes

import (
	"net/http"
	"strconv"
	"time"
)

func timeSyncHandler(w http.ResponseWriter, r *http.Request) {
	t := time.Now().UnixMilli()

	w.Write([]byte(strconv.FormatInt(t, 10)))
}
