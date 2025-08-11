package game

import (
	"github.com/svrem/quizzy/internal/protocol"
)

func (g *Game) GenerateQuestionMessage() *protocol.GameEvent {
	question := &protocol.QuestionData{
		Question:   g.CurrentQuestion.Question,
		Difficulty: g.CurrentQuestion.Difficulty,
		Category:   g.CurrentQuestion.Category,
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_QUESTION,
		EventData: &protocol.GameEvent_Question{
			Question: question,
		},
	}

	return event
}

func (g *Game) GenerateAnswerPhaseMessage() *protocol.GameEvent {
	answerPhase := &protocol.AnswerPhaseData{
		AnswerShownAt: g.QuestionSubmissionDeadline,
		Duration:      AnswerDuration,
		Answers:       g.CurrentQuestion.Answers,
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_START_ANSWER_PHASE,
		EventData: &protocol.GameEvent_AnswerPhase{
			AnswerPhase: answerPhase,
		},
	}

	return event
}

func (g *Game) GenerateShowAnswerMessage() *protocol.GameEvent {
	voteSum := g.QuestionVotes[0] + g.QuestionVotes[1] + g.QuestionVotes[2] + g.QuestionVotes[3]
	answerPercentages := make([]float32, 4)
	if voteSum > 0 {
		for i := 0; i < 4; i++ {
			answerPercentages[i] = float32(g.QuestionVotes[i]) / float32(voteSum) * 100
		}
	}

	correctAnswer := &protocol.CorrectAnswerData{
		Correct:     g.CurrentQuestion.Correct,
		Percentages: answerPercentages,
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_SHOW_ANSWER,
		EventData: &protocol.GameEvent_ShowAnswer{
			ShowAnswer: correctAnswer,
		},
	}

	return event
}

func GenerateUpdateUserStatsMessage(
	newStreak int,
	newScore int,
) *protocol.GameEvent {

	updateUserStats := &protocol.UpdateUserStatsData{
		Streak: int32(newStreak),
		Score:  int32(newScore),
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_UPDATE_USER_STATS,
		EventData: &protocol.GameEvent_UpdateUserStats{
			UpdateUserStats: updateUserStats,
		},
	}

	return event
}

func (g *Game) GenerateCategorySelectionMessage() *protocol.GameEvent {
	categorySelection := &protocol.CategorySelectionData{
		Categories: g.SelectedCategories,
		EndTime:    g.CategorySelectionDeadline,
		Duration:   CategorySelectionDuration,
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_CATEGORY_SELECTION,
		EventData: &protocol.GameEvent_CategorySelection{
			CategorySelection: categorySelection,
		},
	}

	return event
}

func (g *Game) GenerateCategoryVotesMessage() *protocol.GameEvent {
	voteSum := g.CategoryVotes[0] + g.CategoryVotes[1] + g.CategoryVotes[2]

	votePercentages := make([]float32, 3)
	if voteSum > 0 {
		votePercentages[0] = float32(g.CategoryVotes[0]) / float32(voteSum) * 100
		votePercentages[1] = float32(g.CategoryVotes[1]) / float32(voteSum) * 100
		votePercentages[2] = float32(g.CategoryVotes[2]) / float32(voteSum) * 100
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

	categoryVotes := &protocol.CategoryVotesData{
		VotePercentages:  votePercentages,
		SelectedCategory: int32(maxCategoryIndex),
	}

	event := &protocol.GameEvent{
		Type: protocol.GameEventType_CATEGORY_VOTES,
		EventData: &protocol.GameEvent_CategoryVotes{
			CategoryVotes: categoryVotes,
		},
	}

	return event
}

func (g *Game) GenerateLeaderboardMessage(leaderboard *protocol.LeaderboardData) *protocol.GameEvent {
	event := &protocol.GameEvent{
		Type: protocol.GameEventType_SHOW_LEADERBOARD,
		EventData: &protocol.GameEvent_ShowLeaderboard{
			ShowLeaderboard: leaderboard,
		},
	}

	return event
}
