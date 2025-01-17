package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/mariopavlov/nexus/backend/internal/core/usecases"
	"github.com/mariopavlov/nexus/backend/internal/infrastructure/ai"
	"github.com/mariopavlov/nexus/backend/internal/infrastructure/repositories/postgres"
	"github.com/mariopavlov/nexus/backend/internal/interfaces/http/handlers"
)

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/nexus?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Repository
	chatRepo := postgres.NewChatRepository(db)

	// AI Service
	ollamaURL := os.Getenv("OLLAMA_URL")
	aiService := ai.NewOllamaService(ollamaURL)

	// Use cases
	chatUseCase := usecases.NewChatUseCase(chatRepo, aiService)

	// HTTP Handler
	chatHandler := handlers.NewChatHandler(chatUseCase)

	// Initialize Gin router
	r := gin.Default()

	// Apply CORS middleware
	r.Use(CORSMiddleware())

	// Register routes
	chatHandler.RegisterRoutes(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
