package usecases

import (
	"context"
	"fmt"
	"time"

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
	chat, err := uc.chatRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get chat: %w", err)
	}

	// Get messages for this chat
	messages, err := uc.chatRepo.GetMessages(ctx, id, 50, 0) // Get last 50 messages
	if err != nil {
		return nil, fmt.Errorf("failed to get chat messages: %w", err)
	}

	chat.Messages = messages
	return chat, nil
}

func (uc *chatUseCase) ListChats(ctx context.Context, limit, offset int) ([]*domain.Chat, error) {
	return uc.chatRepo.List(ctx, limit, offset)
}

func (uc *chatUseCase) DeleteChat(ctx context.Context, id domain.ChatID) error {
	return uc.chatRepo.Delete(ctx, id)
}

func (uc *chatUseCase) SendMessage(ctx context.Context, chatID domain.ChatID, content string, model string) (*domain.Message, error) {
	// Get chat history
	messages, err := uc.chatRepo.GetMessages(ctx, chatID, 10, 0) // Get last 10 messages for context
	if err != nil {
		return nil, fmt.Errorf("failed to get chat history: %w", err)
	}

	// Create and save user message
	userMessage := domain.NewMessage(chatID, content, domain.UserRole, model)
	err = uc.chatRepo.AddMessage(ctx, chatID, userMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to save user message: %w", err)
	}

	// Add the new user message to the history
	messages = append(messages, userMessage)

	// Get AI response with chat history
	aiResponse, err := uc.modelService.SendMessage(ctx, userMessage, messages)
	if err != nil {
		return nil, fmt.Errorf("failed to get AI response: %w", err)
	}

	// Save AI response
	err = uc.chatRepo.AddMessage(ctx, chatID, aiResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to save AI response: %w", err)
	}

	return aiResponse, nil
}

func (uc *chatUseCase) GetChatHistory(ctx context.Context, chatID domain.ChatID, limit, offset int) ([]*domain.Message, error) {
	return uc.chatRepo.GetMessages(ctx, chatID, limit, offset)
}

func (uc *chatUseCase) ListAvailableModels(ctx context.Context) ([]string, error) {
	return uc.modelService.ListAvailableModels(ctx)
}

func (uc *chatUseCase) UpdateChat(ctx context.Context, id domain.ChatID, title string) (*domain.Chat, error) {
	chat, err := uc.chatRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	chat.Title = title
	chat.UpdatedAt = time.Now()

	err = uc.chatRepo.Update(ctx, chat)
	if err != nil {
		return nil, err
	}

	return chat, nil
}
