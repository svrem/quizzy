package game

type GameEvent struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type Question struct {
	Question   string   `json:"question"`
	Answers    []string `json:"answers"`
	Correct    int      `json:"correct"`
	Difficulty string   `json:"difficulty"`
	Category   string   `json:"category"`
}

type QuestionData struct {
	Question   string `json:"question"`
	Difficulty string `json:"difficulty"`
	Category   string `json:"category"`
	EndTime    int64  `json:"end_time"`
}

type AnswerPhaseData struct {
	AnswerShownAt int64    `json:"answer_shown_at"`
	Answers       []string `json:"answers"`
}
