package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"piaoji-server/internal/config"
	"piaoji-server/internal/database"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/model"
	"piaoji-server/internal/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// LoginRequest 登录请求
type LoginRequest struct {
	Code string `json:"code"` // 在 debug 模式下可以为空
}

// LoginResponse 登录响应
type LoginResponse struct {
	Token string              `json:"token"`
	User  *model.UserResponse `json:"user"`
}

// WxSessionResponse 微信 code2session 响应
type WxSessionResponse struct {
	OpenID     string `json:"openid"`
	SessionKey string `json:"session_key"`
	UnionID    string `json:"unionid"`
	ErrCode    int    `json:"errcode"`
	ErrMsg     string `json:"errmsg"`
}

// Login 微信登录
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	
	// 解析请求体（允许 code 为空）
	if err := c.ShouldBindJSON(&req); err != nil {
		// 在 debug 模式下，允许空请求体
		if config.Cfg.Server.Mode != "debug" {
			response.BadRequest(c, "参数错误")
			return
		}
	}
	
	// 开发模式：允许 code 为空或为特定测试值，直接使用测试用户
	if config.Cfg.Server.Mode == "debug" {
		if req.Code == "" || req.Code == "test" || req.Code == "dev" {
			var user model.User
			testOpenid := "test_user_openid_local"
			result := database.DB.Where("openid = ?", testOpenid).First(&user)
			if result.Error != nil {
				response.ServerError(c, "测试用户不存在，请先初始化数据库")
				return
			}

			// 生成 JWT token
			token, err := middleware.GenerateToken(user.ID, user.Openid)
			if err != nil {
				response.ServerError(c, "生成 token 失败")
				return
			}

			response.Success(c, LoginResponse{
				Token: token,
				User:  user.ToResponse(),
			})
			return
		}
	}

	// 正常模式：必须提供 code
	if req.Code == "" {
		response.BadRequest(c, "参数错误：code 不能为空")
		return
	}

	var openid string

	// 开发模式：支持模拟登录
	if config.Cfg.Server.Mode == "debug" && (req.Code == "test" || req.Code == "dev") {
		openid = "dev_test_openid_" + req.Code
	} else {
		// 调用微信接口获取 openid
		wxResp, err := h.code2Session(req.Code)
		if err != nil {
			response.ServerError(c, "微信登录失败")
			return
		}

		if wxResp.ErrCode != 0 {
			response.BadRequest(c, fmt.Sprintf("微信登录失败: %s", wxResp.ErrMsg))
			return
		}
		openid = wxResp.OpenID
	}

	// 查找或创建用户
	var user model.User
	result := database.DB.Where("openid = ?", openid).First(&user)
	if result.Error != nil {
		// 用户不存在，创建新用户
		nickName := "测试用户"
		user = model.User{
			Openid:     openid,
			NickName:   &nickName,
			PhotoQuota: 100,
		}
		if err := database.DB.Create(&user).Error; err != nil {
			response.ServerError(c, "创建用户失败")
			return
		}
	}

	// 生成 JWT token
	token, err := middleware.GenerateToken(user.ID, user.Openid)
	if err != nil {
		response.ServerError(c, "生成 token 失败")
		return
	}

	response.Success(c, LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	})
}

// Verify 验证 token
func (h *AuthHandler) Verify(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}
	response.SuccessMessage(c, "token 有效")
}

// code2Session 调用微信 code2session 接口
func (h *AuthHandler) code2Session(code string) (*WxSessionResponse, error) {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
		config.Cfg.Wechat.AppID,
		config.Cfg.Wechat.Secret,
		code,
	)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var wxResp WxSessionResponse
	if err := json.Unmarshal(body, &wxResp); err != nil {
		return nil, err
	}

	return &wxResp, nil
}

// BindPhoneRequest 绑定手机号请求
type BindPhoneRequest struct {
	Code string `json:"code" binding:"required"`
}

// BindPhone 绑定手机号
func (h *AuthHandler) BindPhone(c *gin.Context) {
	var req BindPhoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	userID := middleware.GetUserID(c)

	// TODO: 调用微信接口获取手机号
	// 这里需要通过 req.Code 调用微信的 getPhoneNumber 接口
	// 获取到手机号后更新用户信息

	// 模拟获取手机号（实际需要调用微信接口）
	phone := "138****0000"

	// 检查手机号是否已被绑定
	var existingUser model.User
	if err := database.DB.Where("phone = ? AND id != ?", phone, userID).First(&existingUser).Error; err == nil {
		response.BadRequest(c, "该手机号已被其他账号绑定")
		return
	}

	// 更新用户手机号
	if err := database.DB.Model(&model.User{}).Where("id = ?", userID).Update("phone", phone).Error; err != nil {
		response.ServerError(c, "绑定手机号失败")
		return
	}

	response.Success(c, gin.H{"phone": phone})
}
