# 票迹小程序后端服务

基于 Go + Gin + GORM + MySQL 的后端 API 服务。

## 技术栈

- **Web 框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL 8.0
- **JWT**: golang-jwt/jwt
- **配置管理**: viper
- **文件存储**: 七牛云

## 目录结构

```
server/
├── cmd/
│   └── server/
│       └── main.go          # 主入口
├── config/
│   └── config.yaml          # 配置文件
├── internal/
│   ├── config/              # 配置加载
│   ├── database/            # 数据库连接
│   ├── handler/             # 请求处理器
│   │   ├── auth.go          # 认证相关
│   │   ├── user.go          # 用户相关
│   │   ├── ticket.go        # 票据相关
│   │   ├── tag.go           # 标签相关
│   │   └── upload.go        # 上传相关
│   ├── middleware/          # 中间件
│   │   ├── cors.go          # CORS 跨域
│   │   └── jwt.go           # JWT 认证
│   ├── model/               # 数据模型
│   │   ├── user.go
│   │   ├── ticket.go
│   │   └── tag.go
│   ├── response/            # 统一响应
│   └── router/              # 路由配置
└── go.mod
```

## 快速开始

### 1. 安装依赖

```bash
go mod tidy
```

### 2. 配置数据库

编辑 `config/config.yaml`，修改数据库连接信息：

```yaml
database:
  host: localhost
  port: 3306
  user: root
  password: your_password
  dbname: piaoji
  charset: utf8mb4
```

### 3. 创建数据库

```sql
CREATE DATABASE piaoji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务

```bash
go run cmd/server/main.go
```

服务将在 `http://localhost:3001/api` 启动。

## 开发模式

在 debug 模式下，支持模拟登录进行测试：

```bash
# 使用 code=test 或 code=dev 可以跳过微信登录验证
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test"}'
```

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 微信登录（debug模式支持 code=test 模拟登录） |
| GET | /api/auth/verify | 验证 token |
| POST | /api/auth/bind-phone | 绑定手机号 |

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/profile | 获取用户信息 |
| PUT | /api/user/profile | 更新用户信息 |

### 票据

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tickets | 获取票据列表 |
| POST | /api/tickets | 创建票据 |
| GET | /api/tickets/:id | 获取票据详情 |
| PUT | /api/tickets/:id | 更新票据 |
| DELETE | /api/tickets/:id | 删除票据（软删除） |
| POST | /api/tickets/:id/restore | 恢复票据 |
| DELETE | /api/tickets/:id/permanent | 永久删除票据 |

#### 票据字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 票据名称 |
| type | string | 是 | 类型：movie/show/exhibition/train/flight/scenic/other |
| tripNumber | string | 否 | 航班号/车次号 |
| seat | string | 否 | 座位信息 |
| hall | string | 否 | 影厅信息（电影票） |
| version | string | 否 | 版本（IMAX/3D等） |
| showtime | string | 否 | 场次时间 |
| tags | string[] | 否 | 标签数组 |
| price | number | 否 | 票价 |
| photo | string | 否 | 图片 URL |
| date | string | 否 | 活动日期（ISO 8601 格式） |
| location | object | 否 | 地点信息 |
| note | string | 否 | 备注 |
| privacy | string | 否 | 隐私级别：public/private/masked |

### 标签

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 获取所有标签（全局+自定义） |
| GET | /api/tags/global | 获取全局标签 |
| GET | /api/tags/custom | 获取自定义标签 |
| POST | /api/tags | 创建标签 |
| PUT | /api/tags/:id | 更新标签 |
| DELETE | /api/tags/:id | 删除标签 |

### 上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload/token | 获取七牛云上传凭证 |

## 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- `code`: 0 表示成功，非 0 表示错误
- `message`: 响应消息
- `data`: 响应数据

## 数据库表结构

服务启动时会自动创建以下表：

- `users` - 用户表
- `tickets` - 票据表
- `tags` - 标签表（含全局预设标签）

## 配置说明

```yaml
# 服务配置
server:
  port: 3001        # 服务端口
  mode: debug       # 模式：debug/release

# 数据库配置
database:
  host: localhost
  port: 3306
  user: root
  password: root
  dbname: piaoji
  charset: utf8mb4

# JWT 配置
jwt:
  secret: your-secret-key  # 密钥（生产环境请修改）
  expire: 168h             # 过期时间（7天）

# 微信小程序配置
wechat:
  appid: wxxxxxxxxxxx      # 小程序 AppID
  secret: your-secret      # 小程序 AppSecret

# 七牛云配置
qiniu:
  access_key: your-ak
  secret_key: your-sk
  bucket: your-bucket
  domain: https://cdn.example.com
```
