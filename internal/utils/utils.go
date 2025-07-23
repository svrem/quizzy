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

func Contains(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func MaxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
