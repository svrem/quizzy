package auth

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var secretKey string

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, using default environment variables")
	}

	secretKey = os.Getenv("SECRET_KEY")
	if secretKey == "" {
		log.Fatal("SECRET_KEY environment variable is not set")
	}
}
