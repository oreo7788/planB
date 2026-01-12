package handler

import (
	"piaoji-server/internal/database"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/model"
	"piaoji-server/internal/response"

	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

// GetProfile 获取用户信息
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		response.NotFound(c, "用户不存在")
		return
	}

	response.Success(c, user.ToResponse())
}

// UpdateProfileRequest 更新用户信息请求
type UpdateProfileRequest struct {
	NickName  *string `json:"nickName"`
	AvatarUrl *string `json:"avatarUrl"`
}

// UpdateProfile 更新用户信息
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)

	updates := make(map[string]interface{})
	if req.NickName != nil {
		updates["nick_name"] = *req.NickName
	}
	if req.AvatarUrl != nil {
		updates["avatar_url"] = *req.AvatarUrl
	}

	if len(updates) == 0 {
		response.BadRequest(c, "没有需要更新的字段")
		return
	}

	if err := database.DB.Model(&model.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		response.ServerError(c, "更新失败")
		return
	}

	// 返回更新后的用户信息
	var user model.User
	database.DB.First(&user, userID)
	response.Success(c, user.ToResponse())
}
