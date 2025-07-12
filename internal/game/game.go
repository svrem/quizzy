package game

import (
	"time"

	"github.com/svrem/quizzy/internal/protocol"
)

type Game struct {
	Listen chan *protocol.GameEvent

	CurrentQuestion *Question
	QuestionVotes   [4]int

	QuestionPreviewDeadline    int64
	QuestionSubmissionDeadline int64

	CategorySelectionDeadline int64

	SelectedCategory   string
	SelectedCategories []string
	CategoryVotes      [3]int
}

func (g *Game) Start() {
	err := InitializeQuestionDB()

	if err != nil {
		println("Error opening questions database:", err.Error())
		return
	}
	defer CloseQuestionDB()

	for {
		selectedCategories, err := pickThreeRandomCategories()

		if err != nil {
			println("Error picking categories:", err.Error())
			return
		}

		g.SelectedCategories = selectedCategories
		g.CategoryVotes = [3]int{0, 0, 0}

		g.CategorySelectionDeadline = time.Now().Add(CategorySelectionDuration * time.Second).UnixMilli()
		g.Listen <- g.GenerateCategorySelectionMessage()

		time.Sleep(CategorySelectionDuration * time.Second)

		// get the max category vote and set the selected category
		maxVotes := -1
		maxCategoryIndex := -1
		for i, votes := range g.CategoryVotes {
			if votes > maxVotes {
				maxVotes = votes
				maxCategoryIndex = i
			}
		}

		g.Listen <- g.GenerateCategoryVotesMessage()

		time.Sleep(ShowAnswerDuration * time.Second)
		g.SelectedCategory = g.SelectedCategories[maxCategoryIndex]
		g.SelectedCategories = make([]string, 0, 3)

		g.PlayQuestions()

	}

}

func (g *Game) PlayQuestions() {
	questionIndex := 0

	for questionIndex < AmountOfQuestionsPerCategory {
		question, err := getQuestion(g.SelectedCategory)

		if err != nil {
			println("Error fetching question:", err.Error())
			return
		}

		// Set up the current question and end time
		g.CurrentQuestion = &question
		g.QuestionVotes = [4]int{0, 0, 0, 0}
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

		questionIndex++
	}
}

func NewGame() *Game {
	return &Game{
		Listen: make(chan *protocol.GameEvent),
	}
}
