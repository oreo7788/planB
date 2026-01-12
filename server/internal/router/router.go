package router

import (
	"piaoji-server/internal/handler"
	"piaoji-server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	// 创建 handlers
	authHandler := handler.NewAuthHandler()
	userHandler := handler.NewUserHandler()
	ticketHandler := handler.NewTicketHandler()
	tagHandler := handler.NewTagHandler()
	uploadHandler := handler.NewUploadHandler()

	// API 路由组
	api := r.Group("/api")
	{
		// 认证相关（无需登录）
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
		}

		// 需要登录的路由
		authorized := api.Group("")
		authorized.Use(middleware.JWTAuth())
		{
			// 认证相关
			authorized.GET("/auth/verify", authHandler.Verify)
			authorized.POST("/auth/bind-phone", authHandler.BindPhone)

			// 用户相关
			user := authorized.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)
				user.PUT("/profile", userHandler.UpdateProfile)
			}

			// 票据相关
			tickets := authorized.Group("/tickets")
			{
				tickets.GET("", ticketHandler.List)
				tickets.POST("", ticketHandler.Create)
				tickets.GET("/:id", ticketHandler.Get)
				tickets.PUT("/:id", ticketHandler.Update)
				tickets.DELETE("/:id", ticketHandler.Delete)
				tickets.POST("/:id/restore", ticketHandler.Restore)
				tickets.DELETE("/:id/permanent", ticketHandler.PermanentDelete)
			}

			// 标签相关
			tags := authorized.Group("/tags")
			{
				tags.GET("", tagHandler.List)
				tags.GET("/global", tagHandler.GetGlobal)
				tags.GET("/custom", tagHandler.GetCustom)
				tags.POST("", tagHandler.Create)
				tags.PUT("/:id", tagHandler.Update)
				tags.DELETE("/:id", tagHandler.Delete)
			}

			// 上传相关
			upload := authorized.Group("/upload")
			{
				upload.POST("/token", uploadHandler.GetToken)
				upload.POST("/callback", uploadHandler.Callback)
			}
		}
	}
}
