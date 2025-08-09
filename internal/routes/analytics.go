package routes

import (
	"encoding/json"
	"net/http"
	"os"
)

type AnalyticsResponse struct {
	UmamiUrl  string `json:"umamiUrl"`
	WebsiteId string `json:"websiteId"`
}

func analyticsRouteHandler(w http.ResponseWriter, r *http.Request) {
	// return a json object with an umami analytics url and website id. Get those from the process.env

	w.Header().Set("Content-Type", "application/json")

	response := AnalyticsResponse{
		UmamiUrl:  os.Getenv("VITE_ANALYTICS_URL"),
		WebsiteId: os.Getenv("VITE_ANALYTICS_WEBSITE_ID"),
	}

	json.NewEncoder(w).Encode(response)
}
