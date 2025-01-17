package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/mariopavlov/nexus/backend/internal/core/domain"
	"github.com/mariopavlov/nexus/backend/internal/core/ports"
)

type OllamaService struct {
	baseURL string
	client  *http.Client
}

func NewOllamaService(baseURL string) ports.AIModelService {
	if baseURL == "" {
		baseURL = os.Getenv("OLLAMA_URL")
		if baseURL == "" {
			baseURL = "http://localhost:11434"
		}
	}
	return &OllamaService{
		baseURL: baseURL,
		client:  &http.Client{},
	}
}

type ollamaRequest struct {
	Model    string    `json:"model"`
	Messages []message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ollamaResponse struct {
	Model     string `json:"model"`
	CreatedAt string `json:"created_at"`
	Message   struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"message"`
	DoneReason string `json:"done_reason"`
	Done       bool   `json:"done"`
	Error      string `json:"error,omitempty"`
}

func (s *OllamaService) SendMessage(ctx context.Context, msg *domain.Message, history []*domain.Message) (*domain.Message, error) {
	// Convert history to ollama messages format
	messages := make([]message, 0, len(history)+1)
	for _, m := range history {
		messages = append(messages, message{
			Role:    string(m.Role),
			Content: m.Content,
		})
	}
	messages = append(messages, message{
		Role:    string(msg.Role),
		Content: msg.Content,
	})

	reqBody := ollamaRequest{
		Model:    msg.Model,
		Messages: messages,
		Stream:   false,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	fmt.Printf("Sending request to Ollama: %s\n", string(jsonBody))

	req, err := http.NewRequestWithContext(ctx, "POST", s.baseURL+"/api/chat", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	fmt.Printf("Raw Ollama response: %s\n", string(respBody))

	var ollamaResp ollamaResponse
	if err := json.Unmarshal(respBody, &ollamaResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w, body: %s", err, string(respBody))
	}

	fmt.Printf("Decoded Ollama response: %+v\n", ollamaResp)

	if ollamaResp.Error != "" {
		return nil, fmt.Errorf("ollama error: %s", ollamaResp.Error)
	}

	if ollamaResp.Message.Content == "" {
		return nil, fmt.Errorf("empty response content from Ollama")
	}

	return domain.NewMessage(msg.ChatID, ollamaResp.Message.Content, domain.AssistantRole, msg.Model), nil
}

func (s *OllamaService) ListAvailableModels(ctx context.Context) ([]string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", s.baseURL+"/api/tags", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		Models []struct {
			Name string `json:"name"`
		} `json:"models"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	models := make([]string, len(result.Models))
	for i, model := range result.Models {
		models[i] = model.Name
	}

	return models, nil
}
