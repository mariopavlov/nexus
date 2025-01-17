package postgres

import (
	"context"
	"database/sql"

	"github.com/mariopavlov/nexus/backend/internal/core/domain"
	"github.com/mariopavlov/nexus/backend/internal/core/ports"
)

type chatRepository struct {
	db *sql.DB
}

func NewChatRepository(db *sql.DB) ports.ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) Create(ctx context.Context, chat *domain.Chat) error {
	query := `
		INSERT INTO chats (id, title, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.ExecContext(ctx, query, chat.ID, chat.Title, chat.CreatedAt, chat.UpdatedAt)
	return err
}

func (r *chatRepository) GetByID(ctx context.Context, id domain.ChatID) (*domain.Chat, error) {
	query := `
		SELECT id, title, created_at, updated_at
		FROM chats
		WHERE id = $1
	`
	chat := &domain.Chat{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&chat.ID,
		&chat.Title,
		&chat.CreatedAt,
		&chat.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get messages
	messages, err := r.GetMessages(ctx, id, 100, 0)
	if err != nil {
		return nil, err
	}

	// Convert []*Message to []Message
	messageSlice := make([]domain.Message, len(messages))
	for i, msg := range messages {
		messageSlice[i] = *msg
	}
	chat.Messages = messageSlice

	return chat, nil
}

func (r *chatRepository) Update(ctx context.Context, chat *domain.Chat) error {
	query := `
		UPDATE chats
		SET title = $1, updated_at = $2
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, chat.Title, chat.UpdatedAt, chat.ID)
	return err
}

func (r *chatRepository) Delete(ctx context.Context, id domain.ChatID) error {
	query := `DELETE FROM chats WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *chatRepository) List(ctx context.Context, limit, offset int) ([]*domain.Chat, error) {
	query := `
		SELECT id, title, created_at, updated_at
		FROM chats
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chats []*domain.Chat
	for rows.Next() {
		chat := &domain.Chat{}
		err := rows.Scan(
			&chat.ID,
			&chat.Title,
			&chat.CreatedAt,
			&chat.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		chats = append(chats, chat)
	}
	return chats, nil
}

func (r *chatRepository) AddMessage(ctx context.Context, chatID domain.ChatID, message *domain.Message) error {
	query := `
		INSERT INTO messages (id, chat_id, content, role, model, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query,
		message.ID,
		chatID,
		message.Content,
		message.Role,
		message.Model,
		message.CreatedAt,
	)
	return err
}

func (r *chatRepository) GetMessages(ctx context.Context, chatID domain.ChatID, limit, offset int) ([]*domain.Message, error) {
	query := `
		SELECT id, chat_id, content, role, model, created_at
		FROM messages
		WHERE chat_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, chatID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*domain.Message
	for rows.Next() {
		msg := &domain.Message{}
		err := rows.Scan(
			&msg.ID,
			&msg.ChatID,
			&msg.Content,
			&msg.Role,
			&msg.Model,
			&msg.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}
