package handler

import (
	"fmt"
	"piaoji-server/internal/config"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/response"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/qiniu/go-sdk/v7/auth/qbox"
	"github.com/qiniu/go-sdk/v7/storage"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// UploadTokenResponse 上传凭证响应
type UploadTokenResponse struct {
	Token  string `json:"token"`
	Domain string `json:"domain"`
	Key    string `json:"key"`
}

// GetToken 获取七牛云上传凭证
func (h *UploadHandler) GetToken(c *gin.Context) {
	userID := middleware.GetUserID(c)

	cfg := config.Cfg.Qiniu

	// 生成文件名
	key := fmt.Sprintf("tickets/%d/%d_%s.jpg",
		userID,
		time.Now().UnixMilli(),
		randomString(8),
	)

	// 生成上传凭证
	putPolicy := storage.PutPolicy{
		Scope:      fmt.Sprintf("%s:%s", cfg.Bucket, key),
		Expires:    3600, // 1小时有效期
		ReturnBody: `{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}`,
	}

	mac := qbox.NewMac(cfg.AccessKey, cfg.SecretKey)
	upToken := putPolicy.UploadToken(mac)

	response.Success(c, UploadTokenResponse{
		Token:  upToken,
		Domain: cfg.Domain,
		Key:    key,
	})
}

// Callback 七牛云上传回调
func (h *UploadHandler) Callback(c *gin.Context) {
	// TODO: 验证回调签名
	// TODO: 处理上传成功后的逻辑（如更新票据图片字段）

	response.SuccessMessage(c, "ok")
}

// 生成随机字符串
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}
