package game

import (
	"time"
)

type Game struct {
	Broadcaster *Broadcaster

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
		g.Broadcaster.broadcast <- g.GenerateCategorySelectionMessage()

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

		g.Broadcaster.broadcast <- g.GenerateCategoryVotesMessage()

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
		g.Broadcaster.broadcast <- g.GenerateQuestionMessage()

		time.Sleep(QuestionDuration * time.Second)

		g.QuestionSubmissionDeadline = time.Now().Add(AnswerDuration * time.Second).UnixMilli()
		// Start answer phase
		g.Broadcaster.broadcast <- g.GenerateAnswerPhaseMessage()

		time.Sleep(AnswerDuration * time.Second)

		// Show correct answer
		g.Broadcaster.broadcast <- g.GenerateShowAnswerMessage()

		time.Sleep(ShowAnswerDuration * time.Second)

		questionIndex++
	}
}

func NewGame() *Game {
	broadcaster := NewBroadcaster()
	go broadcaster.run()

	return &Game{
		Broadcaster: broadcaster,
	}
}
