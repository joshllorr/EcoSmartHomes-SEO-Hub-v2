# Go Client

Integration specification for Go services:

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatPayload struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

func main() {
	baseURL := "http://127.0.0.1:31415/v1"
	apiKey := os.Getenv("AI_KEY")

	payload := ChatPayload{
		Model: "auto",
		Messages: []Message{
			{Role: "user", Content: "Explain BER A0 standard."},
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", baseURL+"/chat/completions", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}
```
