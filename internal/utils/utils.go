package utils

import (
	"crypto/rand"
	"encoding/base64"
)

func GenerateRandomCode() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic("failed to generate random state: " + err.Error())
	}
	return base64.URLEncoding.EncodeToString(b)
}
