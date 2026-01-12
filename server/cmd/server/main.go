package main

import (
	"flag"
	"fmt"
	"log"
	"piaoji-server/internal/config"
	"piaoji-server/internal/database"
	"piaoji-server/internal/middleware"
	"piaoji-server/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	// 解析命令行参数
	configPath := flag.String("config", "config/config.yaml", "配置文件路径")
	flag.Parse()

	// 加载配置
	if err := config.Load(*configPath); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}
	log.Println("[Config] 配置加载成功")

	// 初始化数据库
	if err := database.Init(); err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}
	log.Println("[Database] 数据库连接成功")

	// 设置 Gin 模式
	gin.SetMode(config.Cfg.Server.Mode)

	// 创建 Gin 实例
	r := gin.Default()
	
	// 添加恢复中间件，捕获 panic
	r.Use(gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		log.Printf("[Recovery] Panic recovered: %v\n", recovered)
		c.JSON(500, gin.H{
			"code":    500,
			"message": fmt.Sprintf("服务器内部错误: %v", recovered),
		})
		c.Abort()
	}))

	// 启用 CORS 中间件
	r.Use(middleware.CorsMiddleware())

	// 设置路由
	router.Setup(r)

	// 启动服务
	addr := fmt.Sprintf(":%d", config.Cfg.Server.Port)
	log.Printf("[Server] 服务启动: http://localhost%s/api", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
