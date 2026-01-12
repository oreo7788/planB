package handler

import (
	"piaoji-server/internal/database"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/model"
	"piaoji-server/internal/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TagHandler struct{}

func NewTagHandler() *TagHandler {
	return &TagHandler{}
}

// List 获取所有标签（全局 + 用户自定义）
func (h *TagHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var tags []model.Tag
	if err := database.DB.Where("type = ? OR user_id = ?", model.TagTypeGlobal, userID).
		Order("type ASC, sort ASC, usage_count DESC").
		Find(&tags).Error; err != nil {
		response.ServerError(c, "查询失败")
		return
	}

	response.Success(c, tags)
}

// GetGlobal 获取全局标签
func (h *TagHandler) GetGlobal(c *gin.Context) {
	var tags []model.Tag
	if err := database.DB.Where("type = ? AND is_active = ?", model.TagTypeGlobal, true).
		Order("sort ASC").
		Find(&tags).Error; err != nil {
		response.ServerError(c, "查询失败")
		return
	}

	response.Success(c, tags)
}

// GetCustom 获取用户自定义标签
func (h *TagHandler) GetCustom(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var tags []model.Tag
	if err := database.DB.Where("type = ? AND user_id = ?", model.TagTypeCustom, userID).
		Order("usage_count DESC").
		Find(&tags).Error; err != nil {
		response.ServerError(c, "查询失败")
		return
	}

	response.Success(c, tags)
}

// Create 创建标签
func (h *TagHandler) Create(c *gin.Context) {
	var req model.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)

	// 检查是否已存在同名标签
	var existingCount int64
	database.DB.Model(&model.Tag{}).
		Where("name = ? AND (type = ? OR user_id = ?)", req.Name, model.TagTypeGlobal, userID).
		Count(&existingCount)
	if existingCount > 0 {
		response.BadRequest(c, "标签名称已存在")
		return
	}

	// 创建标签
	tag := model.Tag{
		Name:   req.Name,
		Type:   model.TagTypeCustom,
		UserID: &userID,
		Color:  "#07c160",
	}
	if req.Color != nil {
		tag.Color = *req.Color
	}
	if req.Icon != nil {
		tag.Icon = req.Icon
	}

	if err := database.DB.Create(&tag).Error; err != nil {
		response.ServerError(c, "创建失败")
		return
	}

	response.Success(c, tag)
}

// Update 更新标签
func (h *TagHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	var req model.UpdateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找标签（只能修改自己的标签）
	var tag model.Tag
	if err := database.DB.Where("id = ? AND type = ? AND user_id = ?", id, model.TagTypeCustom, userID).First(&tag).Error; err != nil {
		response.NotFound(c, "标签不存在")
		return
	}

	// 构建更新
	updates := make(map[string]interface{})
	if req.Name != nil {
		// 检查新名称是否重复
		var existingCount int64
		database.DB.Model(&model.Tag{}).
			Where("name = ? AND id != ? AND (type = ? OR user_id = ?)", *req.Name, id, model.TagTypeGlobal, userID).
			Count(&existingCount)
		if existingCount > 0 {
			response.BadRequest(c, "标签名称已存在")
			return
		}
		updates["name"] = *req.Name
	}
	if req.Color != nil {
		updates["color"] = *req.Color
	}
	if req.Icon != nil {
		updates["icon"] = *req.Icon
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if len(updates) == 0 {
		response.BadRequest(c, "没有需要更新的字段")
		return
	}

	if err := database.DB.Model(&tag).Updates(updates).Error; err != nil {
		response.ServerError(c, "更新失败")
		return
	}

	database.DB.First(&tag, id)
	response.Success(c, tag)
}

// Delete 删除标签
func (h *TagHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找标签（只能删除自己的标签）
	var tag model.Tag
	if err := database.DB.Where("id = ? AND type = ? AND user_id = ?", id, model.TagTypeCustom, userID).First(&tag).Error; err != nil {
		response.NotFound(c, "标签不存在")
		return
	}

	// 删除标签
	if err := database.DB.Delete(&tag).Error; err != nil {
		response.ServerError(c, "删除失败")
		return
	}

	// TODO: 从所有关联的票据中移除该标签

	response.SuccessMessage(c, "删除成功")
}
