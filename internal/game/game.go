package game

import (
	"time"
)

const (
	QuestionDuration   = 5
	AnswerDuration     = 15
	ShowAnswerDuration = 5
)

type Game struct {
	Listen chan GameEvent

	// The current question
	current_question  Question
	question_end_time int64
}

func (g *Game) Start() {
	question_session := NewQuestionSession()

	for {
		question, err := question_session.GetQuestion()

		if err != nil {
			println("Error fetching question:", err.Error())
			return
		}

		// Start the game
		g.Listen <- GameEvent{Type: "question", Data: QuestionData{
			Question: question.Question,
			Answers:  question.Answers,
			EndTime:  time.Now().Add(QuestionDuration * time.Second).UnixMilli(),
		}}

		g.current_question = question
		g.question_end_time = time.Now().Add(QuestionDuration * time.Second).UnixMilli()

		time.Sleep(QuestionDuration * time.Second)

		g.Listen <- GameEvent{Type: "start-answer-phase", Data: AnswerPhaseData{
			AnswerShownAt: time.Now().Add(AnswerDuration * time.Second).UnixMilli(),
		}}

		time.Sleep(AnswerDuration * time.Second)

		g.Listen <- GameEvent{Type: "show-answer", Data: question.Correct}

		time.Sleep(ShowAnswerDuration * time.Second)
	}
}

func (g *Game) GenerateWelcomeMessage() GameEvent {
	question := g.current_question

	return GameEvent{
		Type: "question",
		Data: QuestionData{
			Question: question.Question,
			Answers:  question.Answers,
			EndTime:  g.question_end_time,
		},
	}
}

func NewGame() *Game {
	return &Game{
		Listen: make(chan GameEvent),
	}
}
