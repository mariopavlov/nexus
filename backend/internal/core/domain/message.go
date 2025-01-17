package domain

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MessageID uuid.UUID

// Value implements the driver.Valuer interface
func (id MessageID) Value() (driver.Value, error) {
	return uuid.UUID(id).String(), nil
}

// Scan implements the sql.Scanner interface
func (id *MessageID) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	switch v := value.(type) {
	case []byte:
		parsed, err := uuid.ParseBytes(v)
		if err != nil {
			return err
		}
		*id = MessageID(parsed)
		return nil
	case string:
		parsed, err := uuid.Parse(v)
		if err != nil {
			return err
		}
		*id = MessageID(parsed)
		return nil
	case uuid.UUID:
		*id = MessageID(v)
		return nil
	default:
		return fmt.Errorf("unsupported type for MessageID: %T", value)
	}
}

type MessageRole string

const (
	UserRole    MessageRole = "user"
	AssistantRole MessageRole = "assistant"
	SystemRole    MessageRole = "system"
)

type Message struct {
	ID        MessageID `json:"id"`
	ChatID    ChatID   `json:"chat_id"`
	Content   string   `json:"content"`
	Role      MessageRole `json:"role"`
	Model     string   `json:"model"`
	CreatedAt time.Time `json:"created_at"`
}

func NewMessage(chatID ChatID, content string, role MessageRole, model string) *Message {
	return &Message{
		ID:        MessageID(uuid.New()),
		ChatID:    chatID,
		Content:   content,
		Role:      role,
		Model:     model,
		CreatedAt: time.Now(),
	}
}
