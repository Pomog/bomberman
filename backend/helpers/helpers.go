package helpers

import (
	"fmt"
	"path/filepath"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// GenerateNewUUID generates a new random UUID (Universally Unique Identifier) and returns it as a string.
// If an error occurs while generating the UUID, it will be returned along with an empty string.
func GenerateNewUUID() (string, error) {
	uuid, err := uuid.NewRandom() // Generate a random UUID
	if err != nil {
		return "", err // Return error if UUID generation fails
	}
	return uuid.String(), nil // Convert UUID to string and return
}

// HashPassword hashes a given password using bcrypt and returns the hashed password as a string.
// It uses the default bcrypt cost, which is 10, ensuring a balance between speed and security.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost) // Generate hash
	return string(bytes), err                                                       // Return hashed password as string, along with any error
}

// CompareHashToPassword compares a hashed password with a plain text password.
// Returns true if the passwords match, false otherwise.
func CompareHashToPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)) // Compare hash with plain password
	return err == nil                                                              // If no error, passwords match; otherwise, they don't
}

// ShortMessage truncates a message if its length exceeds 100 characters, appending '...' to indicate truncation.
// It is useful for logging or displaying only a snippet of long messages.
func ShortMessage(message []byte) []byte {
	if len(message) > 100 { // Check if the message exceeds 100 characters
		shortMessage := make([]byte, 100) // Create a new slice to store the shortened message
		copy(shortMessage, message[:97])  // Copy the first 97 characters
		shortMessage[97] = '.'            // Add ellipsis (...) after truncation
		shortMessage[98] = '.'
		shortMessage[99] = '.'
		return append(shortMessage, []byte("...")...) // Return the truncated message with ellipsis
	}
	return message // If the message is already short enough, return it as is
}

// FindFile searches for files matching a pattern in a given directory.
// If any matching files are found, it returns the first match. If none are found, it returns an empty string.
func FindFile(targetDir string, pattern string) string {
	matches, err := filepath.Glob(targetDir + pattern) // Search for files that match the pattern
	if err != nil {
		fmt.Println(err) // Print any errors that occur during the search
	}
	if len(matches) != 0 {
		return matches[0] // Return the first matched file if found
	}
	return "" // Return an empty string if no files match
}
