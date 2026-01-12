# 票迹小程序 - H5 嵌套方案

一款帮助用户收藏票据、记录人生轨迹的微信小程序，采用小程序壳 + H5 内核的混合架构。

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      微信小程序壳                            │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ 入口页  │  │  web-view   │  │    原生能力页面      │    │
│  │ 登录    │  │  H5 容器    │  │ 选图/定位/手机号    │    │
│  └─────────┘  └─────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vue 3 H5 应用                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 首页    │  │ 添加    │  │ 详情    │  │ 个人中心│       │
│  │ 时间线  │  │ 票迹    │  │ 页面    │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ 标签    │  │ 回收站  │  │ 关于    │                    │
│  │ 管理    │  │         │  │ 我们    │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Go 后端服务                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Auth    │  │ Ticket  │  │  Tag    │  │ Upload  │       │
│  │ 登录    │  │ CRUD    │  │ 标签    │  │ 七牛云  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                          │                                  │
│                    ┌─────┴─────┐                           │
│                    │   MySQL   │                           │
│                    └───────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 项目结构

```
planB/
├── miniprogram/          # 微信小程序壳
│   ├── pages/
│   │   ├── index/        # 启动页（登录）
│   │   ├── webview/      # H5 容器
│   │   └── native/       # 原生能力页面
│   │       ├── choose-image/    # 选择图片
│   │       ├── choose-location/ # 选择地点
│   │       └── bind-phone/      # 绑定手机号
│   └── utils/
│       ├── auth.ts       # 登录逻辑
│       └── bridge.ts     # H5 通信
│
├── h5/                   # Vue 3 H5 应用
│   ├── src/
│   │   ├── views/        # 页面
│   │   │   ├── home/     # 首页时间线
│   │   │   ├── add/      # 添加/编辑票迹
│   │   │   ├── detail/   # 票迹详情
│   │   │   ├── mine/     # 个人中心
│   │   │   ├── tags/     # 标签管理
│   │   │   ├── trash/    # 回收站
│   │   │   └── about/    # 关于我们（隐私政策/用户协议）
│   │   ├── components/   # 组件
│   │   │   ├── TicketCard.vue      # 票据卡片
│   │   │   ├── ImageUploader.vue   # 图片上传
│   │   │   ├── LocationPicker.vue  # 地点选择
│   │   │   ├── TabBar.vue          # 底部导航
│   │   │   ├── MovieDetail.vue     # 电影票详情
│   │   │   ├── TrainDetail.vue     # 火车票详情
│   │   │   ├── FlightDetail.vue    # 机票详情
│   │   │   └── ScenicDetail.vue    # 景区门票详情
│   │   ├── stores/       # Pinia 状态
│   │   │   ├── user.ts   # 用户状态
│   │   │   └── ticket.ts # 票据状态
│   │   ├── api/          # API 接口
│   │   │   ├── ticket.ts # 票据接口
│   │   │   ├── tag.ts    # 标签接口
│   │   │   ├── upload.ts # 上传接口
│   │   │   └── user.ts   # 用户接口
│   │   ├── data/         # 静态数据
│   │   │   ├── airports.ts  # 机场数据
│   │   │   ├── airlines.ts  # 航空公司
│   │   │   └── stations.ts  # 火车站数据
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 工具函数
│   │       ├── request.ts  # HTTP 请求
│   │       ├── bridge.ts   # 小程序通信
│   │       └── storage.ts  # 本地存储
│   └── package.json
│
└── server/               # Go 后端服务
    ├── cmd/server/       # 入口
    │   └── main.go
    ├── config/           # 配置
    │   └── config.yaml
    └── internal/
        ├── config/       # 配置加载
        ├── database/     # 数据库连接
        ├── handler/      # 请求处理
        │   ├── auth.go     # 认证
        │   ├── user.go     # 用户
        │   ├── ticket.go   # 票据
        │   ├── tag.go      # 标签
        │   └── upload.go   # 上传
        ├── middleware/   # 中间件
        │   ├── cors.go     # 跨域
        │   └── jwt.go      # JWT
        ├── model/        # 数据模型
        │   ├── user.go
        │   ├── ticket.go
        │   └── tag.go
        ├── response/     # 统一响应
        └── router/       # 路由配置
```

## 快速开始

### 1. 后端服务

```bash
cd server

# 配置数据库和七牛云
# 编辑 config/config.yaml

# 创建数据库
mysql -u root -p -e "CREATE DATABASE piaoji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 安装依赖并运行
go mod tidy
go run cmd/server/main.go
```

**本地测试模式说明：**
- 当 `config.yaml` 中的 `server.mode` 设置为 `debug` 时，系统会自动：
  1. 在数据库初始化时创建测试用户（openid: `test_user_openid_local`）
  2. 登录接口允许 `code` 为空或为 `"test"`/`"dev"`，直接返回测试用户的 token
  3. JWT 中间件跳过登录校验，所有需要认证的接口自动使用测试用户身份
- 这样可以在本地开发时无需配置微信小程序 AppID 和 Secret，直接进行功能测试

### 2. H5 前端

```bash
cd h5

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

### 3. 小程序

1. 使用微信开发者工具导入 `miniprogram` 目录
2. 修改 `app.ts` 中的 `h5BaseUrl` 为你的 H5 部署地址
3. 配置业务域名（H5 必须使用已备案域名）

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 小程序 | 原生微信小程序 + TypeScript |
| H5 前端 | Vue 3 + Vant 4 + Pinia + TypeScript |
| 后端 | Go 1.21 + Gin + GORM |
| 数据库 | MySQL 8.0 |
| 文件存储 | 七牛云 |
| 认证 | JWT |

## 功能清单

### MVP 核心功能 ✅

- [x] 微信登录（小程序 code 换取 token）
- [x] 票据 CRUD（新增/查询/编辑/删除）
- [x] 照片上传（七牛云直传 + 前端压缩）
- [x] 地点选择（单一地点/出发-到达路线）
- [x] 经纬度采集（调用微信定位 API）
- [x] 软删除（30天回收站）
- [x] 回收站恢复/永久删除
- [x] 标签系统（10个全局预设 + 自定义标签）
- [x] 隐私设置（公开/私密/脱敏）
- [x] 容量管理（配额限制 100 张）
- [x] 分类导航（全部/电影/演出/展览/火车/机票/景区/其他）
- [x] 时间线列表（游标分页）
- [x] 关于我们（隐私政策/用户协议）

### 票据类型支持

| 类型 | 字段支持 |
|------|---------|
| 电影票 | 影厅、座位、版本（IMAX/3D）、场次时间 |
| 演出票 | 座位、场馆地点 |
| 展览票 | 展馆地点 |
| 火车票 | 车次号、出发站-到达站、时间 |
| 机票 | 航班号、出发机场-到达机场、时间 |
| 景区门票 | 景区地点 |
| 其他 | 通用字段 |

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 微信登录 |
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
| GET | /api/tickets | 获取票据列表（支持分类、标签筛选） |
| POST | /api/tickets | 创建票据 |
| GET | /api/tickets/:id | 获取票据详情 |
| PUT | /api/tickets/:id | 更新票据 |
| DELETE | /api/tickets/:id | 删除票据（软删除） |
| POST | /api/tickets/:id/restore | 恢复票据 |
| DELETE | /api/tickets/:id/permanent | 永久删除票据 |

### 标签

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 获取所有标签 |
| GET | /api/tags/global | 获取全局标签 |
| GET | /api/tags/custom | 获取自定义标签 |
| POST | /api/tags | 创建标签 |
| PUT | /api/tags/:id | 更新标签 |
| DELETE | /api/tags/:id | 删除标签 |

### 上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload/token | 获取七牛云上传凭证 |

## 数据模型

### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int64 | 主键 |
| openid | string | 微信 openid |
| nick_name | string | 昵称 |
| avatar_url | string | 头像 URL |
| phone | string | 手机号（可选） |
| ticket_count | int | 票据数量 |
| photo_count | int | 已上传照片数 |
| photo_quota | int | 照片配额（默认 100） |

### 票据表 (tickets)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int64 | 主键 |
| ticket_client_id | string | 客户端生成的 UUID（幂等键） |
| user_id | int64 | 用户 ID |
| name | string | 票据名称 |
| type | enum | 类型：movie/show/exhibition/train/flight/scenic/other |
| trip_number | string | 航班号/车次号 |
| seat | string | 座位信息 |
| hall | string | 影厅信息 |
| version | string | 版本（IMAX/3D 等） |
| showtime | string | 场次时间 |
| tags | json | 标签数组 |
| price | decimal | 票价 |
| photo | string | 图片 URL |
| thumbnail | string | 缩略图 URL |
| date | datetime | 活动日期 |
| sort_time | datetime | 排序时间 |
| location | json | 地点信息 |
| note | text | 备注 |
| privacy | enum | 隐私级别：public/private/masked |
| is_deleted | bool | 软删除标记 |
| deleted_at | datetime | 删除时间 |

### 标签表 (tags)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int64 | 主键 |
| name | string | 标签名称 |
| type | enum | 类型：global/custom |
| user_id | int64 | 用户 ID（全局标签为 null） |
| color | string | 标签颜色 |
| icon | string | 图标名称 |
| sort | int | 排序权重 |
| usage_count | int | 使用次数 |
| is_active | bool | 是否启用 |

## 全局预设标签

| 名称 | 颜色 | 图标 |
|------|------|------|
| 约会 | #FF6B6B | heart |
| 亲子 | #4ECDC4 | baby |
| 出差 | #45B7D1 | briefcase |
| 旅行 | #96CEB4 | airplane |
| 朋友聚会 | #FFEAA7 | users |
| 独自一人 | #DDA0DD | user |
| 纪念日 | #FFB6C1 | calendar |
| 生日 | #FF69B4 | cake |
| 首次体验 | #98D8C8 | star |
| 值得再去 | #F7DC6F | refresh |

## 方案优势

1. **热更新**：H5 页面可随时更新，无需小程序审核
2. **开发效率**：Vue 生态成熟，组件丰富（Vant 4）
3. **特效自由**：可使用任意 CSS 动画、Canvas 效果
4. **跨平台**：H5 代码可复用至公众号、APP
5. **独立后端**：Go 服务性能优异，部署灵活

## 注意事项

- web-view 必须使用已备案的业务域名
- 小程序与 H5 通信通过 postMessage + localStorage 轮询
- 图片上传走小程序原生能力，确保内容安全
- 生产环境请修改 JWT secret 和数据库密码

## 后续规划

### V1.1 账号增强
- [ ] 邮箱绑定
- [ ] 账号注销

### V1.2 数据管理
- [ ] 容量进度条提示
- [ ] 批量隐私设置

### V1.3 搜索筛选
- [ ] 按名称/地点搜索
- [ ] 按时间/城市筛选

### V2.0 高级功能
- [ ] OCR 票据识别
- [ ] 会员模块
- [ ] 地图模式
- [ ] 年度报告
