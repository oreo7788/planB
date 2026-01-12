package model

import (
	"time"
)

// User 用户模型
type User struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Openid      string    `gorm:"uniqueIndex;size:64;not null" json:"-"`
	NickName    *string   `gorm:"column:nick_name;size:64" json:"nickName"`
	AvatarUrl   *string   `gorm:"column:avatar_url;size:512" json:"avatarUrl"`
	Phone       *string   `gorm:"uniqueIndex;size:20" json:"phone"`
	TicketCount int       `gorm:"column:ticket_count;default:0" json:"ticketCount"`
	PhotoCount  int       `gorm:"column:photo_count;default:0" json:"photoCount"`
	PhotoQuota  int       `gorm:"column:photo_quota;default:100" json:"photoQuota"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (User) TableName() string {
	return "users"
}

// UserResponse 用户响应 DTO
type UserResponse struct {
	ID          int64   `json:"id"`
	NickName    string  `json:"nickName"`
	AvatarUrl   string  `json:"avatarUrl"`
	Phone       string  `json:"phone,omitempty"`
	TicketCount int     `json:"ticketCount"`
	PhotoCount  int     `json:"photoCount"`
	PhotoQuota  int     `json:"photoQuota"`
	CreatedAt   string  `json:"createdAt"`
}

func (u *User) ToResponse() *UserResponse {
	resp := &UserResponse{
		ID:          u.ID,
		TicketCount: u.TicketCount,
		PhotoCount:  u.PhotoCount,
		PhotoQuota:  u.PhotoQuota,
		CreatedAt:   u.CreatedAt.Format(time.RFC3339),
	}
	if u.NickName != nil {
		resp.NickName = *u.NickName
	}
	if u.AvatarUrl != nil {
		resp.AvatarUrl = *u.AvatarUrl
	}
	if u.Phone != nil {
		resp.Phone = *u.Phone
	}
	return resp
}
