package model

import (
	"time"
)

// TagType 标签类型
type TagType string

const (
	TagTypeGlobal TagType = "global"
	TagTypeCustom TagType = "custom"
)

// Tag 标签模型
type Tag struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string    `gorm:"size:32;not null" json:"name"`
	Type       TagType   `gorm:"size:10;default:custom" json:"type"`
	UserID     *int64    `gorm:"column:user_id;index" json:"userId,omitempty"`
	Color      string    `gorm:"size:16;default:#07c160" json:"color"`
	Icon       *string   `gorm:"size:32" json:"icon,omitempty"`
	Sort       int       `gorm:"default:0" json:"sort"`
	UsageCount int       `gorm:"column:usage_count;default:0" json:"usageCount"`
	IsActive   bool      `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (Tag) TableName() string {
	return "tags"
}

// CreateTagRequest 创建标签请求
type CreateTagRequest struct {
	Name  string  `json:"name" binding:"required,max=32"`
	Color *string `json:"color"`
	Icon  *string `json:"icon"`
}

// UpdateTagRequest 更新标签请求
type UpdateTagRequest struct {
	Name     *string `json:"name"`
	Color    *string `json:"color"`
	Icon     *string `json:"icon"`
	IsActive *bool   `json:"isActive"`
}

// 全局预设标签
var GlobalTags = []Tag{
	{Name: "约会", Type: TagTypeGlobal, Color: "#FF6B6B", Icon: stringPtr("heart"), Sort: 1},
	{Name: "亲子", Type: TagTypeGlobal, Color: "#4ECDC4", Icon: stringPtr("baby"), Sort: 2},
	{Name: "出差", Type: TagTypeGlobal, Color: "#45B7D1", Icon: stringPtr("briefcase"), Sort: 3},
	{Name: "旅行", Type: TagTypeGlobal, Color: "#96CEB4", Icon: stringPtr("airplane"), Sort: 4},
	{Name: "朋友聚会", Type: TagTypeGlobal, Color: "#FFEAA7", Icon: stringPtr("users"), Sort: 5},
	{Name: "独自一人", Type: TagTypeGlobal, Color: "#DDA0DD", Icon: stringPtr("user"), Sort: 6},
	{Name: "纪念日", Type: TagTypeGlobal, Color: "#FFB6C1", Icon: stringPtr("calendar"), Sort: 7},
	{Name: "生日", Type: TagTypeGlobal, Color: "#FF69B4", Icon: stringPtr("cake"), Sort: 8},
	{Name: "首次体验", Type: TagTypeGlobal, Color: "#98D8C8", Icon: stringPtr("star"), Sort: 9},
	{Name: "值得再去", Type: TagTypeGlobal, Color: "#F7DC6F", Icon: stringPtr("refresh"), Sort: 10},
}

func stringPtr(s string) *string {
	return &s
}
