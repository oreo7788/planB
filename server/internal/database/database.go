package database

import (
	"fmt"
	"piaoji-server/internal/config"
	"piaoji-server/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() error {
	dsn := config.Cfg.Database.DSN()

	var logLevel logger.LogLevel
	if config.Cfg.Server.Mode == "debug" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Silent
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	// 自动迁移
	if err := db.AutoMigrate(
		&model.User{},
		&model.Ticket{},
		&model.Tag{},
	); err != nil {
		return fmt.Errorf("数据库迁移失败: %w", err)
	}

	// 初始化全局标签
	if err := initGlobalTags(db); err != nil {
		return fmt.Errorf("初始化全局标签失败: %w", err)
	}

	// 初始化测试用户（仅在 debug 模式下）
	if config.Cfg.Server.Mode == "debug" {
		if err := initTestUser(db); err != nil {
			return fmt.Errorf("初始化测试用户失败: %w", err)
		}
	}

	DB = db
	return nil
}

// 初始化全局标签
func initGlobalTags(db *gorm.DB) error {
	for _, tag := range model.GlobalTags {
		var count int64
		db.Model(&model.Tag{}).Where("name = ? AND type = ?", tag.Name, model.TagTypeGlobal).Count(&count)
		if count == 0 {
			if err := db.Create(&tag).Error; err != nil {
				return err
			}
		}
	}
	return nil
}

// 初始化测试用户
func initTestUser(db *gorm.DB) error {
	testOpenid := "test_user_openid_local"
	nickName := "测试用户"
	avatarUrl := "https://via.placeholder.com/100"
	
	var count int64
	db.Model(&model.User{}).Where("openid = ?", testOpenid).Count(&count)
	if count == 0 {
		user := model.User{
			Openid:     testOpenid,
			NickName:   &nickName,
			AvatarUrl:  &avatarUrl,
			PhotoQuota: 100,
		}
		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}
	return nil
}
