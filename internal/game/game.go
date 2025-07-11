package game

import (
	"math/rand"
	"time"

	"github.com/svrem/quizzy/internal/utils"
)

type Game struct {
	Listen chan GameEvent

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

func pickThreeRandomCategories() ([]string, error) {
	categories, err := getCategories()

	if err != nil {
		return nil, err
	}

	selectedCategories := make([]string, 0, 3)
	for len(selectedCategories) < 3 {
		randomIndex := rand.Intn(len(categories))

		if utils.Contains(selectedCategories, categories[randomIndex]) {
			continue // Skip if the category is already selected
		}

		selectedCategories = append(selectedCategories, categories[randomIndex])
	}
	return selectedCategories, nil
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

func (g *Game) GenerateQuestionMessage() GameEvent {
	question := g.CurrentQuestion

	return GameEvent{
		Type: QuestionEventType,
		Data: QuestionData{
			Question:   question.Question,
			EndTime:    g.QuestionPreviewDeadline,
			Difficulty: question.Difficulty,
			Category:   question.Category,
		},
	}
}

func (g *Game) GenerateAnswerPhaseMessage() GameEvent {
	question := g.CurrentQuestion

	return GameEvent{
		Type: AnswerPhaseEventType,
		Data: AnswerPhaseData{
			AnswerShownAt: g.QuestionSubmissionDeadline,
			Duration:      AnswerDuration,
			Answers:       question.Answers,
		},
	}
}

func (g *Game) GenerateShowAnswerMessage() GameEvent {
	question := g.CurrentQuestion

	voteSum := g.QuestionVotes[0] + g.QuestionVotes[1] + g.QuestionVotes[2] + g.QuestionVotes[3]
	answerPercentages := make([]float64, 4)
	if voteSum > 0 {
		for i := 0; i < 4; i++ {
			answerPercentages[i] = float64(g.QuestionVotes[i]) / float64(voteSum) * 100
		}
	}

	return GameEvent{
		Type: ShowAnswerEventType,
		Data: CorrectAnswerData{
			Correct:     question.Correct,
			Percentages: answerPercentages,
		},
	}
}

func GenerateUpdateUserStatsMessage(
	newStreak int,
	newScore int,
) GameEvent {
	return GameEvent{
		Type: UpdateUserStatsEventType,
		Data: map[string]interface{}{
			"streak": newStreak,
			"score":  newScore,
		},
	}
}

func (g *Game) GenerateCategorySelectionMessage() GameEvent {
	return GameEvent{
		Type: CategorySelectionEventType,
		Data: CategorySelectionData{
			Categories: g.SelectedCategories,
			EndTime:    g.CategorySelectionDeadline,
			Duration:   CategorySelectionDuration,
		},
	}
}

func (g *Game) GenerateCategoryVotesMessage() GameEvent {
	voteSum := g.CategoryVotes[0] + g.CategoryVotes[1] + g.CategoryVotes[2]

	votePercentages := make([]float64, 3)
	if voteSum > 0 {
		votePercentages[0] = float64(g.CategoryVotes[0]) / float64(voteSum) * 100
		votePercentages[1] = float64(g.CategoryVotes[1]) / float64(voteSum) * 100
		votePercentages[2] = float64(g.CategoryVotes[2]) / float64(voteSum) * 100
	}

	// max category vote and set the selected category
	maxVotes := -1
	maxCategoryIndex := -1
	for i, votes := range g.CategoryVotes {
		if votes > maxVotes {
			maxVotes = votes
			maxCategoryIndex = i
		}
	}

	return GameEvent{
		Type: CategoryVotesEventType,
		Data: CategoryVotesData{
			VotePercentages:  votePercentages,
			SelectedCategory: maxCategoryIndex,
		},
	}
}

func NewGame() *Game {
	return &Game{
		Listen: make(chan GameEvent),
	}
}
