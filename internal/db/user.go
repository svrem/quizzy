package db

type RankedUser struct {
	ID             string `json:"id"`
	Username       string `json:"username"`
	ProfilePicture string `json:"profile_picture"`
	Score          int    `json:"score"`
	Ranking        int    `json:"ranking"`
}

func GetUserByEmail(email string) *User {
	var user User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil
	}
	return &user
}

func GetUserByProviderAndID(provider, providerID string) *User {
	var userOAuth UserOAuth
	if err := db.Where("provider = ? AND provider_id = ?", provider, providerID).First(&userOAuth).Error; err != nil {
		return nil
	}
	return GetUserByID(userOAuth.UserID)
}

func GetUserByID(id string) *User {
	var user User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil
	}
	return &user
}

func CreateUser(user *User) error {
	return db.Create(user).Error
}

func CreateUserOAuth(userOAuth *UserOAuth) error {
	return db.Create(userOAuth).Error
}

func UpdateManyUsers(users []*User) error {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, user := range users {
		if err := tx.Save(user).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}
	return nil
}

var RankedUsers []*RankedUser

func GetUserRanking(user *User) (int, error) {
	for _, rankedUser := range RankedUsers {
		if rankedUser.ID == user.ID {
			return rankedUser.Ranking, nil
		}
	}
	return 0, nil
}

func FetchUserRankings() error {
	result := db.Raw(`
		SELECT id, username, profile_picture, score,
		DENSE_RANK() OVER (ORDER BY score DESC, created_at ASC) AS ranking
		FROM users
		ORDER BY score DESC, created_at ASC
	`).Scan(&RankedUsers)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
