package handler

import (
	"encoding/json"
	"fmt"
	"piaoji-server/internal/database"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/model"
	"piaoji-server/internal/response"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TicketHandler struct{}

func NewTicketHandler() *TicketHandler {
	return &TicketHandler{}
}

// List 获取票据列表
func (h *TicketHandler) List(c *gin.Context) {
	var req model.TicketListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if req.Limit <= 0 || req.Limit > 100 {
		req.Limit = 20
	}

	userID := middleware.GetUserID(c)

	// 构建查询
	query := database.DB.Model(&model.Ticket{}).Where("user_id = ?", userID)

	// 是否查询回收站
	query = query.Where("is_deleted = ?", req.IsDeleted)

	// 按类型筛选
	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	// 按标签筛选
	if req.Tag != "" {
		query = query.Where("JSON_CONTAINS(tags, ?)", fmt.Sprintf(`"%s"`, req.Tag))
	}

	// 获取总数
	var total int64
	query.Count(&total)

	// 游标分页
	if req.Cursor != "" {
		// 游标格式: sortTime_id
		query = query.Where("CONCAT(sort_time, '_', id) < ?", req.Cursor)
	}

	// 查询数据
	var tickets []model.Ticket
	if err := query.Order("sort_time DESC, id DESC").Limit(req.Limit + 1).Find(&tickets).Error; err != nil {
		response.ServerError(c, "查询失败")
		return
	}

	// 判断是否还有更多
	hasMore := len(tickets) > req.Limit
	if hasMore {
		tickets = tickets[:req.Limit]
	}

	// 生成下一页游标
	var cursor string
	if len(tickets) > 0 && hasMore {
		last := tickets[len(tickets)-1]
		cursor = fmt.Sprintf("%s_%d", last.SortTime.Format(time.RFC3339Nano), last.ID)
	}

	response.Success(c, model.TicketListResponse{
		List:    tickets,
		Cursor:  cursor,
		HasMore: hasMore,
		Total:   total,
	})
}

// Get 获取票据详情
func (h *TicketHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	userID := middleware.GetUserID(c)

	var ticket model.Ticket
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&ticket).Error; err != nil {
		response.NotFound(c, "票据不存在")
		return
	}

	response.Success(c, ticket)
}

// Create 创建票据
func (h *TicketHandler) Create(c *gin.Context) {
	var req model.CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[TicketHandler] 参数绑定失败: %v\n", err)
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)
	fmt.Printf("[TicketHandler] 创建票据请求 - UserID: %d, Name: %s, Type: %s\n", userID, req.Name, req.Type)
	
	if userID == 0 {
		fmt.Printf("[TicketHandler] 错误: UserID 为 0\n")
		response.ServerError(c, "用户ID无效")
		return
	}

	// 检查用户配额
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		fmt.Printf("[TicketHandler] 获取用户信息失败: %v, UserID: %d\n", err, userID)
		response.ServerError(c, fmt.Sprintf("获取用户信息失败: %v", err))
		return
	}
	fmt.Printf("[TicketHandler] 用户信息获取成功: ID=%d, Name=%s\n", user.ID, *user.NickName)

	if user.PhotoCount >= user.PhotoQuota && req.Photo != nil {
		response.BadRequest(c, "已达到照片上限，请清理回收站或升级会员")
		return
	}

	// 检查 ticketClientId 是否重复
	var existingCount int64
	database.DB.Model(&model.Ticket{}).Where("ticket_client_id = ?", req.TicketClientID).Count(&existingCount)
	if existingCount > 0 {
		response.BadRequest(c, "票据已存在")
		return
	}

	// 解析日期
	var date *time.Time
	if req.Date != nil && *req.Date != "" {
		t, err := time.Parse(time.RFC3339, *req.Date)
		if err == nil {
			date = &t
		}
	}

	// 计算 sortTime
	sortTime := time.Now()
	if date != nil {
		sortTime = *date
	}

	// 转换 tags 为 JSON
	var tagsJSON model.JSON
	if len(req.Tags) > 0 {
		tagsBytes, err := json.Marshal(req.Tags)
		if err != nil {
			fmt.Printf("[TicketHandler] Tags JSON 序列化失败: %v\n", err)
			tagsJSON = []byte("[]")
		} else {
			tagsJSON = tagsBytes
		}
	} else {
		tagsJSON = []byte("[]")
	}
	fmt.Printf("[TicketHandler] Tags JSON: %s\n", string(tagsJSON))

	// 转换 location 为 JSON
	var locationJSON model.JSON
	if req.Location != nil {
		locationBytes, err := json.Marshal(req.Location)
		if err != nil {
			fmt.Printf("[TicketHandler] Location JSON 序列化失败: %v\n", err)
			locationJSON = nil
		} else {
			locationJSON = locationBytes
			fmt.Printf("[TicketHandler] Location JSON: %s\n", string(locationJSON))
		}
	}

	// 设置默认隐私级别
	privacy := req.Privacy
	if privacy == "" {
		privacy = model.PrivacyPublic
	}

	// 创建票据
	ticket := model.Ticket{
		TicketClientID: req.TicketClientID,
		UserID:         userID,
		Name:           req.Name,
		Type:           req.Type,
		TripNumber:     req.TripNumber,
		Seat:           req.Seat,
		Hall:           req.Hall,
		Version:        req.Version,
		Showtime:       req.Showtime,
		Tags:           tagsJSON,
		Price:          req.Price,
		Photo:          req.Photo,
		Date:           date,
		SortTime:       sortTime,
		Location:       locationJSON,
		Note:           req.Note,
		Privacy:        privacy,
	}

	// 自动生成缩略图 URL
	if req.Photo != nil && *req.Photo != "" {
		thumbnailURL := *req.Photo + "?imageView2/1/w/300/h/300/q/80"
		ticket.Thumbnail = &thumbnailURL
	}

	// 打印完整的票据数据用于调试
	fmt.Printf("[TicketHandler] 准备创建票据，数据详情:\n")
	fmt.Printf("  TicketClientID: %s\n", ticket.TicketClientID)
	fmt.Printf("  UserID: %d\n", ticket.UserID)
	fmt.Printf("  Name: %s\n", ticket.Name)
	fmt.Printf("  Type: %s\n", ticket.Type)
	fmt.Printf("  Tags: %s\n", string(ticket.Tags))
	fmt.Printf("  SortTime: %v\n", ticket.SortTime)
	
	if err := database.DB.Create(&ticket).Error; err != nil {
		fmt.Printf("[TicketHandler] 数据库创建失败: %v\n", err)
		fmt.Printf("[TicketHandler] 错误类型: %T\n", err)
		fmt.Printf("[TicketHandler] 票据数据: %+v\n", ticket)
		response.ServerError(c, fmt.Sprintf("创建票据失败: %v", err))
		return
	}

	fmt.Printf("[TicketHandler] 票据创建成功 - ID: %d\n", ticket.ID)

	// 更新用户统计
	updates := map[string]interface{}{
		"ticket_count": user.TicketCount + 1,
	}
	if req.Photo != nil {
		updates["photo_count"] = user.PhotoCount + 1
	}
	database.DB.Model(&model.User{}).Where("id = ?", userID).Updates(updates)

	response.Success(c, ticket)
}

// Update 更新票据
func (h *TicketHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	var req model.UpdateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找票据
	var ticket model.Ticket
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&ticket).Error; err != nil {
		response.NotFound(c, "票据不存在")
		return
	}

	// 构建更新
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Type != nil {
		updates["type"] = *req.Type
	}
	if req.TripNumber != nil {
		updates["trip_number"] = *req.TripNumber
	}
	if req.Seat != nil {
		updates["seat"] = *req.Seat
	}
	if req.Hall != nil {
		updates["hall"] = *req.Hall
	}
	if req.Version != nil {
		updates["version"] = *req.Version
	}
	if req.Showtime != nil {
		updates["showtime"] = *req.Showtime
	}
	if req.Tags != nil {
		tagsJSON, _ := json.Marshal(req.Tags)
		updates["tags"] = tagsJSON
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.Photo != nil {
		updates["photo"] = *req.Photo
		if *req.Photo != "" {
			thumbnailURL := *req.Photo + "?imageView2/1/w/300/h/300/q/80"
			updates["thumbnail"] = thumbnailURL
		}
	}
	if req.Date != nil {
		if *req.Date != "" {
			t, err := time.Parse(time.RFC3339, *req.Date)
			if err == nil {
				updates["date"] = t
				updates["sort_time"] = t
			}
		} else {
			updates["date"] = nil
			updates["sort_time"] = ticket.CreatedAt
		}
	}
	if req.Location != nil {
		locationJSON, _ := json.Marshal(req.Location)
		updates["location"] = locationJSON
	}
	if req.Note != nil {
		updates["note"] = *req.Note
	}
	if req.Privacy != "" {
		updates["privacy"] = req.Privacy
	}

	if len(updates) == 0 {
		response.BadRequest(c, "没有需要更新的字段")
		return
	}

	if err := database.DB.Model(&ticket).Updates(updates).Error; err != nil {
		response.ServerError(c, "更新失败")
		return
	}

	// 重新查询返回
	database.DB.First(&ticket, id)
	response.Success(c, ticket)
}

// Delete 删除票据（软删除）
func (h *TicketHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找票据
	var ticket model.Ticket
	if err := database.DB.Where("id = ? AND user_id = ? AND is_deleted = ?", id, userID, false).First(&ticket).Error; err != nil {
		response.NotFound(c, "票据不存在")
		return
	}

	// 软删除
	now := time.Now()
	if err := database.DB.Model(&ticket).Updates(map[string]interface{}{
		"is_deleted": true,
		"deleted_at": now,
	}).Error; err != nil {
		response.ServerError(c, "删除失败")
		return
	}

	response.SuccessMessage(c, "已移入回收站")
}

// Restore 恢复票据
func (h *TicketHandler) Restore(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找票据
	var ticket model.Ticket
	if err := database.DB.Where("id = ? AND user_id = ? AND is_deleted = ?", id, userID, true).First(&ticket).Error; err != nil {
		response.NotFound(c, "票据不存在")
		return
	}

	// 恢复
	if err := database.DB.Model(&ticket).Updates(map[string]interface{}{
		"is_deleted": false,
		"deleted_at": nil,
	}).Error; err != nil {
		response.ServerError(c, "恢复失败")
		return
	}

	response.Success(c, ticket)
}

// PermanentDelete 永久删除票据
func (h *TicketHandler) PermanentDelete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	userID := middleware.GetUserID(c)

	// 查找票据
	var ticket model.Ticket
	if err := database.DB.Where("id = ? AND user_id = ? AND is_deleted = ?", id, userID, true).First(&ticket).Error; err != nil {
		response.NotFound(c, "票据不存在")
		return
	}

	// 永久删除
	if err := database.DB.Unscoped().Delete(&ticket).Error; err != nil {
		response.ServerError(c, "删除失败")
		return
	}

	// 更新用户统计
	updates := map[string]interface{}{}
	database.DB.Model(&model.User{}).Where("id = ?", userID).
		UpdateColumn("ticket_count", database.DB.Raw("ticket_count - 1"))
	if ticket.Photo != nil {
		database.DB.Model(&model.User{}).Where("id = ?", userID).
			UpdateColumn("photo_count", database.DB.Raw("photo_count - 1"))
	}
	database.DB.Model(&model.User{}).Where("id = ?", userID).Updates(updates)

	response.SuccessMessage(c, "已永久删除")
}
