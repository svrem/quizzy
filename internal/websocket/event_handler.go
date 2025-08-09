package websocket

import (
	"math"
	"time"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/protocol"
	"github.com/svrem/quizzy/internal/utils"
	"google.golang.org/protobuf/proto"
)

func (h *Hub) handleUserMessage(message Message) {

	var userEvent protocol.UserEvent
	if err := proto.Unmarshal(message.Data, &userEvent); err != nil {
		println("Error unmarshalling user event:", err)
		return
	}

	switch userEvent.Type {
	case protocol.UserEventType_HELLO:
		welcomeUser(message.Client, h.currentGame)
	case protocol.UserEventType_SELECT_ANSWER:
		h.handleUserSelectAnswer(message.Client, &userEvent)
	case protocol.UserEventType_SELECT_CATEGORY:
		h.handleUserSelectCategory(message.Client, &userEvent)
	default:
		println("Unknown message type:", userEvent.Type)
	}
}

func (h *Hub) handleGameEvent(event *protocol.GameEvent) {
	// inject the current server time into the event
	event.Timestamp = time.Now().UnixMilli()

	eventStr, err := proto.Marshal(event)
	if err != nil {
		println("Error marshalling event:", err)
		return
	}

	switch event.Type {
	case protocol.GameEventType_QUESTION:
		h.handleGameQuestionEvent()
	case protocol.GameEventType_CATEGORY_VOTES:
		h.handleGameCategoryVotesEvent()
	case protocol.GameEventType_SHOW_ANSWER:
		h.handleGameShowAnswerEvent()
	case protocol.GameEventType_SHOW_LEADERBOARD:
		h.handleShowLeaderboardEvent()
		return
	}

	for client := range h.clients {
		sendMessageToClient(client, eventStr)
	}
}

// supporting functions
func welcomeUser(client *Client, currentGame *game.Game) {
	currentTime := time.Now().UnixMilli()

	if len(currentGame.SelectedCategories) != 0 {
		questionMessage := currentGame.GenerateCategorySelectionMessage()
		questionMessageStr, err := proto.Marshal(questionMessage)
		if err != nil {
			println("Error marshalling category selection message:", err)
			return
		}
		sendMessageToClient(client, questionMessageStr)

		if currentTime < currentGame.CategorySelectionDeadline {
			return
		}

		questionMessage = currentGame.GenerateCategoryVotesMessage()
		questionMessageStr, err = proto.Marshal(questionMessage)
		if err != nil {
			println("Error marshalling category votes message:", err)
			return
		}
		sendMessageToClient(client, questionMessageStr)

		return
	}

	if currentTime < currentGame.LeaderboardDeadline {
		sendLeaderboardEventToClient(client)
		return
	}

	if currentGame.CurrentQuestion == nil {
		return
	}

	questionMessage := currentGame.GenerateQuestionMessage()
	questionMessageStr, err := proto.Marshal(questionMessage)
	if err != nil {
		println("Error marshalling question message:", err)
		return
	}
	sendMessageToClient(client, questionMessageStr)

	if currentTime < currentGame.QuestionPreviewDeadline {
		return
	}

	answerPhaseMessage := currentGame.GenerateAnswerPhaseMessage()
	answerPhaseMessageStr, err := proto.Marshal(answerPhaseMessage)
	if err != nil {
		println("Error marshalling answer phase message:", err)
		return
	}
	sendMessageToClient(client, answerPhaseMessageStr)

	if currentTime < currentGame.QuestionSubmissionDeadline {
		return
	}

	showAnswerMessage := currentGame.GenerateShowAnswerMessage()
	showAnswerMessageStr, err := proto.Marshal(showAnswerMessage)
	if err != nil {
		println("Error marshalling show answer message:", err)
		return
	}
	sendMessageToClient(client, showAnswerMessageStr)

}

func sendMessageToClient(client *Client, message []byte) {
	select {
	case client.send <- message:
	default:
		close(client.send)
		delete(client.hub.clients, client)
	}
}

func (h *Hub) handleUserSelectAnswer(client *Client, event *protocol.UserEvent) {
	answerIndex := event.GetSelectAnswer().AnswerIndex

	if client.selectedAnswer != -1 {
		h.currentGame.QuestionVotes[client.selectedAnswer]--
	}

	client.selectedAnswer = answerIndex
	h.currentGame.QuestionVotes[answerIndex]++
}

func (h *Hub) handleUserSelectCategory(client *Client, event *protocol.UserEvent) {
	categoryIndex := event.GetSelectCategory().CategoryIndex

	if client.selectedCategory != -1 {
		h.currentGame.CategoryVotes[client.selectedCategory]--
	}

	client.selectedCategory = categoryIndex
	h.currentGame.CategoryVotes[categoryIndex]++
}

func (h *Hub) handleGameQuestionEvent() {
	for client := range h.clients {
		client.selectedAnswer = -1
	}
}

func (h *Hub) handleGameCategoryVotesEvent() {
	for client := range h.clients {
		client.selectedCategory = -1
	}
}

func (h *Hub) handleGameShowAnswerEvent() {
	var updatedUsers []*db.User

	for client := range h.clients {
		// if the streak is 0 and the client has not selected an answer, nothing will happen, so continue
		if client.user.Streak == 0 && client.selectedAnswer == -1 {
			continue
		}

		if client.selectedAnswer == h.currentGame.CurrentQuestion.Correct {
			client.user.Score += int(math.Round(math.Pow(game.BaseScoreIncrement, 1+game.ScoreExponentIncrement*float64(client.user.Streak))))
			client.user.Streak++

			if client.user.Streak > client.user.MaxStreak {
				client.user.MaxStreak = client.user.Streak
			}
		} else {
			client.user.Streak = 0
		}

		msg := game.GenerateUpdateUserStatsMessage(client.user.Streak, client.user.Score)
		msgStr, err := proto.Marshal(msg)
		if err != nil {
			println("Error marshalling user stats message:", err)
			continue
		}

		sendMessageToClient(client, msgStr)

		if client.user.ID != "" {
			updatedUsers = append(updatedUsers, client.user)
		}
	}

	// Update the users in the database
	db.UpdateManyUsers(updatedUsers)
}

var previousRankedUsers = make(map[string]*int32)
var rankedUsers []*protocol.RankedUser
var topUsersLeaderboardEventStr []byte

func (h *Hub) handleShowLeaderboardEvent() {
	err := db.FetchUserRankings()
	if err != nil {
		println("Error fetching leaderboard:", err.Error())
		return
	}

	rankedUsers = make([]*protocol.RankedUser, len(db.RankedUsers))
	for i, user := range db.RankedUsers {
		rankedUsers[i] = &protocol.RankedUser{
			Id:             user.ID,
			Username:       user.Username,
			ProfilePicture: user.ProfilePicture,
			Score:          int32(user.Score),
			Ranking:        int32(user.Ranking),
		}

		if previousRankedUsers[user.ID] != nil {
			rankedUsers[i].PreviousRanking = *previousRankedUsers[user.ID]
		}

		previousRankedUsers[user.ID] = &rankedUsers[i].Ranking
	}

	topUsersLeaderboardEvent := &protocol.GameEvent{
		Type: protocol.GameEventType_SHOW_LEADERBOARD,
		EventData: &protocol.GameEvent_ShowLeaderboard{
			ShowLeaderboard: &protocol.LeaderboardData{
				Users: rankedUsers[:utils.MinInt(len(rankedUsers), 10)],
			},
		},
	}
	topUsersLeaderboardEventStr, err = proto.Marshal(topUsersLeaderboardEvent)
	if err != nil {
		println("Error marshalling leaderboard event:", err)
		return
	}

	for client := range h.clients {
		sendLeaderboardEventToClient(client)
	}
}

func sendLeaderboardEventToClient(client *Client) {
	if client.user.ID == "" {
		sendMessageToClient(client, topUsersLeaderboardEventStr)
		return
	}

	// if the user is logged in, send the users surrounding the client

	ranking, err := db.GetUserRanking(client.user)
	if err != nil {
		println("Error getting user ranking:", err)
		return
	}

	startIndex := utils.MaxInt(0, ranking-5)
	endIndex := utils.MinInt(len(rankedUsers), startIndex+10)

	if endIndex-startIndex < 10 {
		startIndex = utils.MaxInt(0, endIndex-10)
	}

	surroundingUsers := rankedUsers[startIndex:endIndex]
	surroundingLeaderboardEvent := &protocol.GameEvent{
		Type: protocol.GameEventType_SHOW_LEADERBOARD,
		EventData: &protocol.GameEvent_ShowLeaderboard{
			ShowLeaderboard: &protocol.LeaderboardData{
				Users: surroundingUsers,
			},
		},
	}
	surroundingLeaderboardEventStr, err := proto.Marshal(surroundingLeaderboardEvent)
	if err != nil {
		println("Error marshalling surrounding leaderboard event:", err)
		return
	}

	sendMessageToClient(client, surroundingLeaderboardEventStr)
}
