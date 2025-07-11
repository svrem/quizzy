package game

type GameEventType string

const (
	QuestionEventType          GameEventType = "question"
	AnswerPhaseEventType       GameEventType = "start-answer-phase"
	ShowAnswerEventType        GameEventType = "show-answer"
	UpdateUserStatsEventType   GameEventType = "update-user-stats"
	CategorySelectionEventType GameEventType = "category-selection"
	CategoryVotesEventType     GameEventType = "category-votes"
)

type GameEvent struct {
	Type GameEventType `json:"type"`
	Data interface{}   `json:"data"`
}

type Question struct {
	Question   string   `json:"question"`
	Answers    []string `json:"answers"`
	Correct    int      `json:"correct"`
	Difficulty string   `json:"difficulty"`
	Category   string   `json:"category"`
}

type QuestionDB struct {
	Question         string `json:"question"`
	CorrectAnswer    string `json:"correct_answer"`
	IncorrectAnswers string `json:"incorrect_answers"`
	Category         string `json:"category"`
	Difficulty       string `json:"difficulty"`
	QuestionType     string `json:"question_type"`
}

type QuestionData struct {
	Question   string `json:"question"`
	Difficulty string `json:"difficulty"`
	Category   string `json:"category"`
	EndTime    int64  `json:"end_time"`
}

type AnswerPhaseData struct {
	AnswerShownAt int64    `json:"answer_shown_at"`
	Duration      int      `json:"duration"`
	Answers       []string `json:"answers"`
}

type CorrectAnswerData struct {
	Correct     int       `json:"correct"`
	Percentages []float64 `json:"percentages"`
}

type CategorySelectionData struct {
	Categories []string `json:"categories"`
	EndTime    int64    `json:"end_time"`
	Duration   int      `json:"duration"`
}

type CategoryVotesData struct {
	VotePercentages  []float64 `json:"vote_percentages"`
	SelectedCategory int       `json:"selected_category"`
}
