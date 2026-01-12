package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// TicketType 票据类型
type TicketType string

const (
	TicketTypeMovie      TicketType = "movie"
	TicketTypeShow       TicketType = "show"
	TicketTypeExhibition TicketType = "exhibition"
	TicketTypeTrain      TicketType = "train"
	TicketTypeFlight     TicketType = "flight"
	TicketTypeScenic     TicketType = "scenic"
	TicketTypeOther      TicketType = "other"
)

// PrivacyLevel 隐私级别
type PrivacyLevel string

const (
	PrivacyPublic  PrivacyLevel = "public"
	PrivacyPrivate PrivacyLevel = "private"
	PrivacyMasked  PrivacyLevel = "masked"
)

// JSON 类型，用于存储 JSON 字段
type JSON json.RawMessage

func (j JSON) Value() (driver.Value, error) {
	if len(j) == 0 || j == nil {
		return nil, nil
	}
	// 确保返回的是有效的 JSON 字符串
	return []byte(j), nil
}

func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	}
	*j = bytes
	return nil
}

func (j JSON) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return j, nil
}

func (j *JSON) UnmarshalJSON(data []byte) error {
	if j == nil {
		return nil
	}
	*j = data
	return nil
}

// Ticket 票据模型
type Ticket struct {
	ID             int64        `gorm:"primaryKey;autoIncrement" json:"id"`
	TicketClientID string       `gorm:"column:ticket_client_id;uniqueIndex;size:64;not null" json:"ticketClientId"`
	UserID         int64        `gorm:"column:user_id;index;not null" json:"userId"`
	Name           string       `gorm:"size:128;not null" json:"name"`
	Type           TicketType   `gorm:"size:20;not null" json:"type"`
	TripNumber     *string      `gorm:"column:trip_number;size:32" json:"tripNumber,omitempty"` // 航班号/车次号
	Seat           *string      `gorm:"size:64" json:"seat,omitempty"`                          // 座位信息（电影票/演出票）
	Hall           *string      `gorm:"size:64" json:"hall,omitempty"`                          // 影厅信息（电影票）
	Version        *string      `gorm:"size:32" json:"version,omitempty"`                       // 电影版本（IMAX/3D/原版等）
	Showtime       *string      `gorm:"size:32" json:"showtime,omitempty"`                      // 场次时间（电影票）
	Tags           JSON         `gorm:"type:json" json:"tags"`
	Price          *float64     `gorm:"type:decimal(10,2)" json:"price,omitempty"`
	Photo          *string      `gorm:"size:512" json:"photo,omitempty"`
	Thumbnail      *string      `gorm:"size:512" json:"thumbnail,omitempty"`
	Date           *time.Time   `json:"date,omitempty"`
	SortTime       time.Time    `gorm:"column:sort_time;index" json:"sortTime"`
	Location       JSON         `gorm:"type:json" json:"location,omitempty"`
	Note           *string      `gorm:"type:text" json:"note,omitempty"`
	Privacy        PrivacyLevel `gorm:"size:10;default:public" json:"privacy"`
	IsDeleted      bool         `gorm:"column:is_deleted;default:false" json:"isDeleted"`
	DeletedAt      *time.Time   `gorm:"column:deleted_at" json:"deletedAt,omitempty"`
	CreatedAt      time.Time    `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt      time.Time    `gorm:"column:updated_at" json:"updatedAt"`
}

func (Ticket) TableName() string {
	return "tickets"
}

// Location 地点结构
type Location struct {
	Type       string      `json:"type"` // single 或 route
	City       string      `json:"city,omitempty"`
	Address    string      `json:"address,omitempty"`
	Coordinate *Coordinate `json:"coordinate,omitempty"`
	Departure  *RoutePoint `json:"departure,omitempty"`
	Arrival    *RoutePoint `json:"arrival,omitempty"`
}

type Coordinate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type RoutePoint struct {
	City       string      `json:"city"`
	Station    string      `json:"station,omitempty"`
	Coordinate *Coordinate `json:"coordinate,omitempty"`
}

// CreateTicketRequest 创建票据请求
type CreateTicketRequest struct {
	TicketClientID string       `json:"ticketClientId" binding:"required"`
	Name           string       `json:"name" binding:"required,max=128"`
	Type           TicketType   `json:"type" binding:"required"`
	TripNumber     *string      `json:"tripNumber"` // 航班号/车次号
	Seat           *string      `json:"seat"`       // 座位信息
	Hall           *string      `json:"hall"`       // 影厅信息
	Version        *string      `json:"version"`    // 电影版本
	Showtime       *string      `json:"showtime"`   // 场次时间
	Tags           []string     `json:"tags"`
	Price          *float64     `json:"price"`
	Photo          *string      `json:"photo"`
	Date           *string      `json:"date"`
	Location       *Location    `json:"location"`
	Note           *string      `json:"note"`
	Privacy        PrivacyLevel `json:"privacy"`
}

// UpdateTicketRequest 更新票据请求
type UpdateTicketRequest struct {
	Name       *string      `json:"name"`
	Type       *TicketType  `json:"type"`
	TripNumber *string      `json:"tripNumber"` // 航班号/车次号
	Seat       *string      `json:"seat"`       // 座位信息
	Hall       *string      `json:"hall"`       // 影厅信息
	Version    *string      `json:"version"`    // 电影版本
	Showtime   *string      `json:"showtime"`   // 场次时间
	Tags       []string     `json:"tags"`
	Price      *float64     `json:"price"`
	Photo      *string      `json:"photo"`
	Date       *string      `json:"date"`
	Location   *Location    `json:"location"`
	Note       *string      `json:"note"`
	Privacy    PrivacyLevel `json:"privacy"`
}

// TicketListRequest 票据列表请求
type TicketListRequest struct {
	Cursor    string     `form:"cursor"`
	Limit     int        `form:"limit,default=20"`
	Type      TicketType `form:"type"`
	Tag       string     `form:"tag"`
	IsDeleted bool       `form:"isDeleted"`
}

// TicketListResponse 票据列表响应
type TicketListResponse struct {
	List    []Ticket `json:"list"`
	Cursor  string   `json:"cursor"`
	HasMore bool     `json:"hasMore"`
	Total   int64    `json:"total"`
}
