package auth

import (
	"github.com/svrem/quizzy/internal/utils"
)

func generateState() string {
	return utils.GenerateRandomCode()
}
