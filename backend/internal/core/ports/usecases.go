package ports

import (
	"context"

	"github.com/mariopavlov/nexus/backend/internal/core/domain"
)

type ChatUseCase interface {
	CreateChat(ctx context.Context, title string) (*domain.Chat, error)
	GetChat(ctx context.Context, id domain.ChatID) (*domain.Chat, error)
	ListChats(ctx context.Context, limit, offset int) ([]*domain.Chat, error)
	DeleteChat(ctx context.Context, id domain.ChatID) error
	SendMessage(ctx context.Context, chatID domain.ChatID, content string, model string) (*domain.Message, error)
	GetChatHistory(ctx context.Context, chatID domain.ChatID, limit, offset int) ([]*domain.Message, error)
	ListAvailableModels(ctx context.Context) ([]string, error)
}
