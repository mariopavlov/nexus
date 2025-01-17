package domain

import (
	"time"

	"github.com/google/uuid"
)

type ChatID uuid.UUID

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
