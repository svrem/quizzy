package game

import (
	"time"

	"github.com/svrem/quizzy/internal/faker"
	"github.com/svrem/quizzy/internal/protocol"
)

type Game struct {
	Broadcaster *Broadcaster

	CurrentQuestion *Question
	QuestionVotes   [4]int

	QuestionPreviewDeadline    int64
	QuestionSubmissionDeadline int64

	CategorySelectionDeadline int64

	LeaderboardDeadline int64

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
		g.Broadcaster.broadcast <- g.GenerateLeaderboardMessage(
			&protocol.LeaderboardData{
				Users: make([]*protocol.RankedUser, 0, 10),
			},
		)

		g.LeaderboardDeadline = time.Now().Add(LeaderboardDuration * time.Second).UnixMilli()
		time.Sleep(LeaderboardDuration * time.Second)

		g.selectCategory()

		g.playQuestions()

	}
}

func (g *Game) selectCategory() {
	selectedCategories, err := pickThreeRandomCategories()

	if err != nil {
		println("Error picking categories:", err.Error())
		return
	}

	g.SelectedCategories = selectedCategories
	g.CategoryVotes = [3]int{0, 0, 0}

	g.Broadcaster.broadcast <- g.GenerateCategorySelectionMessage()

	g.CategorySelectionDeadline = time.Now().Add(CategorySelectionDuration * time.Second).UnixMilli()
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

	distributedCategoryVotes := faker.CreateDistribution(len(g.SelectedCategories), maxCategoryIndex, TotalAutoVoteAmount, 1.5, 0.8)

	g.CategoryVotes = [3]int{0, 0, 0}
	copy(g.CategoryVotes[:], distributedCategoryVotes)

	g.Broadcaster.broadcast <- g.GenerateCategoryVotesMessage()

	time.Sleep(CategoryDisplayVotesDuration * time.Second)

	// get the max category vote and set the selected category
	maxVotes = -1
	maxCategoryIndex = -1
	for i, votes := range g.CategoryVotes {
		if votes > maxVotes {
			maxVotes = votes
			maxCategoryIndex = i
		}
	}

	g.SelectedCategory = g.SelectedCategories[maxCategoryIndex]
	g.SelectedCategories = make([]string, 0, 3)
}

func (g *Game) generateVoteDistribution() {

	var bias float64
	var spread float64

	switch g.CurrentQuestion.Difficulty {
	case "easy":
		bias = 2.0   // strongly favor correct answer
		spread = 0.5 // lower spread for wrong answers
	case "medium":
		bias = 1.3   // slight bias toward correct answer
		spread = 1.0 // wrong answers can get closer
	case "hard":
		bias = 1.0   // basically no bias
		spread = 1.0 // equal-ish distribution
	default:
		bias = 1.3
		spread = 1.0
	}
	distributions := faker.CreateDistribution(len(g.CurrentQuestion.Answers), int(g.CurrentQuestion.Correct), TotalAutoVoteAmount, bias, spread)

	g.QuestionVotes = [4]int{0, 0, 0, 0}
	copy(g.QuestionVotes[:], distributions)
}

func (g *Game) playQuestions() {

	questions, err := getQuestions(g.SelectedCategory, AmountOfQuestionsPerCategory)
	if err != nil {
		println("Error fetching questions:", err.Error())
		return
	}

	questionIndex := 0

	for _, question := range questions {

		// Set up the current question and end time
		g.CurrentQuestion = &question
		g.generateVoteDistribution()
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
