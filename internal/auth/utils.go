package auth

import (
	"crypto/rand"
	"encoding/base64"
)

func generateState() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic("failed to generate random state: " + err.Error())
	}
	return base64.URLEncoding.EncodeToString(b)
}
