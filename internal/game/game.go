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

	currentQuestion Question

	QuestionPreviewDeadline    int64
	QuestionSubmissionDeadline int64
}

func (g *Game) Start() {
	questionSession := NewQuestionSession()

	for {
		question, err := questionSession.GetQuestion()

		if err != nil {
			println("Error fetching question:", err.Error())
			return
		}

		// Set up the current question and end time
		g.currentQuestion = question
		g.QuestionPreviewDeadline = time.Now().Add(QuestionDuration * time.Second).UnixMilli()

		// Start the game with question
		g.Listen <- g.GenerateQuestionMessage()

		time.Sleep(QuestionDuration * time.Second)

		g.QuestionSubmissionDeadline = time.Now().Add(AnswerDuration * time.Second).UnixMilli()
		// Start answer phase
		g.Listen <- g.GenerateAnswerPhaseMessage()

		time.Sleep(AnswerDuration * time.Second)

		// Show correct answer
		g.Listen <- g.GenerateShowAnswerMessage()

		time.Sleep(ShowAnswerDuration * time.Second)
	}
}

func (g *Game) GenerateQuestionMessage() GameEvent {
	question := g.currentQuestion

	return GameEvent{
		Type: "question",
		Data: QuestionData{
			Question:   question.Question,
			EndTime:    g.QuestionPreviewDeadline,
			Difficulty: question.Difficulty,
			Category:   question.Category,
		},
	}
}

func (g *Game) GenerateAnswerPhaseMessage() GameEvent {
	question := g.currentQuestion

	return GameEvent{
		Type: "start-answer-phase",
		Data: AnswerPhaseData{
			AnswerShownAt: g.QuestionSubmissionDeadline,
			Answers:       question.Answers,
		},
	}
}

func (g *Game) GenerateShowAnswerMessage() GameEvent {
	question := g.currentQuestion

	return GameEvent{
		Type: "show-answer",
		Data: question.Correct,
	}
}

// func (g *Game) GenerateWelcomeMessage() GameEvent {
// 	question := g.current_question

// 	return GameEvent{
// 		Type: "question",
// 		Data: QuestionData{
// 			Question: question.Question,
// 			EndTime:  g.question_end_time,
// 		},
// 	}
// }

func NewGame() *Game {
	return &Game{
		Listen: make(chan GameEvent),
	}
}
