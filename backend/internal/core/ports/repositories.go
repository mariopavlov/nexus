package ports

import (
	"context"

	"github.com/mariopavlov/nexus/backend/internal/core/domain"
)

type ChatRepository interface {
	Create(ctx context.Context, chat *domain.Chat) error
	GetByID(ctx context.Context, id domain.ChatID) (*domain.Chat, error)
	Update(ctx context.Context, chat *domain.Chat) error
	Delete(ctx context.Context, id domain.ChatID) error
	List(ctx context.Context, limit, offset int) ([]*domain.Chat, error)
	AddMessage(ctx context.Context, chatID domain.ChatID, message *domain.Message) error
	GetMessages(ctx context.Context, chatID domain.ChatID, limit, offset int) ([]*domain.Message, error)
}

type AIModelService interface {
	SendMessage(ctx context.Context, message *domain.Message, history []*domain.Message) (*domain.Message, error)
	ListAvailableModels(ctx context.Context) ([]string, error)
}
