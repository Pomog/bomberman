package handlers

import (
	"encoding/json"
	"github.com/Pomog/bomberman/backend/server"
	"net/http"
)

// HealthCheckResponse is the structure for the health check response
type HealthCheckResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// HealthCheck handler for checking if the backend is running
func HealthCheck(app *server.Application) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set the response headers for CORS and content type
		w.Header().Add("Content-Type", "application/json")
		w.Header().Add("Access-Control-Allow-Origin", "*")

		// Create a simple response to indicate the backend is running
		response := HealthCheckResponse{
			Status:  "OK",
			Message: "Backend is up and running!",
		}

		// Write the response as JSON
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}
