package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"piaoji-server/internal/config"
	"piaoji-server/internal/database"
	"piaoji-server/internal/model"
	"piaoji-server/internal/response"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Claims JWT 声明
type Claims struct {
	UserID int64  `json:"userId"`
	Openid string `json:"openid"`
	jwt.RegisteredClaims
}

// GenerateToken 生成 JWT token
func GenerateToken(userID int64, openid string) (string, error) {
	expire, err := time.ParseDuration(config.Cfg.JWT.Expire)
	if err != nil {
		expire = 7 * 24 * time.Hour // 默认 7 天
	}

	claims := Claims{
		UserID: userID,
		Openid: openid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Cfg.JWT.Secret))
}

// ParseToken 解析 JWT token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Cfg.JWT.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("无效的 token")
}

// JWTAuth JWT 认证中间件
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开发模式：跳过登录校验，直接使用测试用户
		if config.Cfg.Server.Mode == "debug" {
			// 查找测试用户
			var testUser model.User
			testOpenid := "test_user_openid_local"
			if err := database.DB.Where("openid = ?", testOpenid).First(&testUser).Error; err == nil {
				// 将测试用户信息存入上下文
				c.Set("userID", testUser.ID)
				c.Set("openid", testUser.Openid)
				fmt.Printf("[JWTAuth] Debug模式: 使用测试用户 ID=%d\n", testUser.ID)
				c.Next()
				return
			} else {
				fmt.Printf("[JWTAuth] Debug模式: 测试用户不存在，错误: %v\n", err)
				// 即使测试用户不存在，也继续执行，让正常流程处理
			}
		}

		// 正常模式：从 Header 获取 token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "请先登录")
			c.Abort()
			return
		}

		// 解析 Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Unauthorized(c, "认证格式错误")
			c.Abort()
			return
		}

		// 解析 token
		claims, err := ParseToken(parts[1])
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				response.Error(c, http.StatusUnauthorized, "登录已过期，请重新登录")
			} else {
				response.Unauthorized(c, "认证失败")
			}
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("userID", claims.UserID)
		c.Set("openid", claims.Openid)
		c.Next()
	}
}

// GetUserID 从上下文获取用户 ID
func GetUserID(c *gin.Context) int64 {
	userID, exists := c.Get("userID")
	if !exists {
		return 0
	}
	return userID.(int64)
}

// GetOpenid 从上下文获取 openid
func GetOpenid(c *gin.Context) string {
	openid, exists := c.Get("openid")
	if !exists {
		return ""
	}
	return openid.(string)
}
