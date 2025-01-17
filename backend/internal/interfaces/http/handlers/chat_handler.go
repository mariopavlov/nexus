package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mariopavlov/nexus/backend/internal/core/domain"
	"github.com/mariopavlov/nexus/backend/internal/core/ports"
)

type ChatHandler struct {
	chatUseCase ports.ChatUseCase
}

func NewChatHandler(chatUseCase ports.ChatUseCase) *ChatHandler {
	return &ChatHandler{
		chatUseCase: chatUseCase,
	}
}

type CreateChatRequest struct {
	Title string `json:"title" binding:"required"`
}

type SendMessageRequest struct {
	Content string `json:"content" binding:"required"`
	Model   string `json:"model" binding:"required"`
}

func (h *ChatHandler) RegisterRoutes(r *gin.Engine) {
	r.POST("/chats", h.CreateChat)
	r.GET("/chats", h.ListChats)
	r.GET("/chats/:id", h.GetChat)
	r.DELETE("/chats/:id", h.DeleteChat)
	r.POST("/chats/:id/messages", h.SendMessage)
	r.GET("/chats/:id/messages", h.GetMessages)
	r.GET("/models", h.ListModels)
}

func (h *ChatHandler) CreateChat(c *gin.Context) {
	var req CreateChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chat, err := h.chatUseCase.CreateChat(c.Request.Context(), req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chat)
}

func (h *ChatHandler) GetChat(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	chat, err := h.chatUseCase.GetChat(c.Request.Context(), domain.ChatID(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chat)
}

func (h *ChatHandler) ListChats(c *gin.Context) {
	limit, _ := strconv.Atoi(c.Query("limit"))
	offset, _ := strconv.Atoi(c.Query("offset"))
	if limit == 0 {
		limit = 10
	}

	chats, err := h.chatUseCase.ListChats(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chats)
}

func (h *ChatHandler) DeleteChat(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	err = h.chatUseCase.DeleteChat(c.Request.Context(), domain.ChatID(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message, err := h.chatUseCase.SendMessage(c.Request.Context(), domain.ChatID(id), req.Content, req.Model)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, message)
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	limit, _ := strconv.Atoi(c.Query("limit"))
	offset, _ := strconv.Atoi(c.Query("offset"))
	if limit == 0 {
		limit = 50
	}

	messages, err := h.chatUseCase.GetChatHistory(c.Request.Context(), domain.ChatID(id), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func (h *ChatHandler) ListModels(c *gin.Context) {
	models, err := h.chatUseCase.ListAvailableModels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models)
}
