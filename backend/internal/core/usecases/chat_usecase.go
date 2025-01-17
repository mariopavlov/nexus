package usecases

import (
	"context"

	"github.com/mariopavlov/nexus/backend/internal/core/domain"
	"github.com/mariopavlov/nexus/backend/internal/core/ports"
)

type chatUseCase struct {
	chatRepo     ports.ChatRepository
	modelService ports.AIModelService
}

func NewChatUseCase(chatRepo ports.ChatRepository, modelService ports.AIModelService) ports.ChatUseCase {
	return &chatUseCase{
		chatRepo:     chatRepo,
		modelService: modelService,
	}
}

func (uc *chatUseCase) CreateChat(ctx context.Context, title string) (*domain.Chat, error) {
	chat := domain.NewChat(title)
	err := uc.chatRepo.Create(ctx, chat)
	if err != nil {
		return nil, err
	}
	return chat, nil
}

func (uc *chatUseCase) GetChat(ctx context.Context, id domain.ChatID) (*domain.Chat, error) {
	return uc.chatRepo.GetByID(ctx, id)
}

func (uc *chatUseCase) ListChats(ctx context.Context, limit, offset int) ([]*domain.Chat, error) {
	return uc.chatRepo.List(ctx, limit, offset)
}

func (uc *chatUseCase) DeleteChat(ctx context.Context, id domain.ChatID) error {
	return uc.chatRepo.Delete(ctx, id)
}

func (uc *chatUseCase) SendMessage(ctx context.Context, chatID domain.ChatID, content string, model string) (*domain.Message, error) {
	userMessage := domain.NewMessage(chatID, content, domain.UserRole, model)
	err := uc.chatRepo.AddMessage(ctx, chatID, userMessage)
	if err != nil {
		return nil, err
	}

	// Get AI response
	aiResponse, err := uc.modelService.SendMessage(ctx, userMessage)
	if err != nil {
		return nil, err
	}

	// Save AI response
	err = uc.chatRepo.AddMessage(ctx, chatID, aiResponse)
	if err != nil {
		return nil, err
	}

	return aiResponse, nil
}

func (uc *chatUseCase) GetChatHistory(ctx context.Context, chatID domain.ChatID, limit, offset int) ([]*domain.Message, error) {
	return uc.chatRepo.GetMessages(ctx, chatID, limit, offset)
}

func (uc *chatUseCase) ListAvailableModels(ctx context.Context) ([]string, error) {
	return uc.modelService.ListAvailableModels(ctx)
}
