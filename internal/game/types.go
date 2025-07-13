package game

type Question struct {
	Question   string   `json:"question"`
	Answers    []string `json:"answers"`
	Correct    int32    `json:"correct"`
	Difficulty string   `json:"difficulty"`
	Category   string   `json:"category"`
}

type RawQuestionFromDB struct {
	Question         string `json:"question"`
	CorrectAnswer    string `json:"correct_answer"`
	IncorrectAnswers string `json:"incorrect_answers"`
	Category         string `json:"category"`
	Difficulty       string `json:"difficulty"`
	QuestionType     string `json:"question_type"`
}
