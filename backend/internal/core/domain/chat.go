package domain

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ChatID uuid.UUID

// Value implements the driver.Valuer interface
func (id ChatID) Value() (driver.Value, error) {
	return uuid.UUID(id).String(), nil
}

// Scan implements the sql.Scanner interface
func (id *ChatID) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	switch v := value.(type) {
	case []byte:
		parsed, err := uuid.ParseBytes(v)
		if err != nil {
			return err
		}
		*id = ChatID(parsed)
		return nil
	case string:
		parsed, err := uuid.Parse(v)
		if err != nil {
			return err
		}
		*id = ChatID(parsed)
		return nil
	case uuid.UUID:
		*id = ChatID(v)
		return nil
	default:
		return fmt.Errorf("unsupported type for ChatID: %T", value)
	}
}

type Chat struct {
	ID        ChatID    `json:"id"`
	Title     string    `json:"title"`
	Messages  []Message `json:"messages"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewChat(title string) *Chat {
	now := time.Now()

	return &Chat{
		ID:        ChatID(uuid.New()),
		Title:     title,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
