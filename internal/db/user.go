package db

func GetUserByProviderAndID(provider, providerID string) *User {
	var user User
	if err := db.Where("provider = ? AND provider_id = ?", provider, providerID).First(&user).Error; err != nil {
		return nil
	}
	return &user
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

func GetUserRanking(user *User) (int, error) {
	var count int64
	if err := db.Model(&User{}).Where("score > ?", user.Score).Count(&count).Error; err != nil {
		return 0, err
	}

	ranking := int(count) + 1
	return ranking, nil
}
