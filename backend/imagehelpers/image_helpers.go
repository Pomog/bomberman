package imagehelpers

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

// ConvertBase64ToImg takes a base64 encoded string and decodes it into a byte slice.
// It returns the decoded bytes or an error if the decoding fails.
func ConvertBase64ToImg(encodedImg string) ([]byte, error) {
	// Decode the base64 string into a byte slice
	dec, err := base64.StdEncoding.DecodeString(encodedImg)
	if err != nil {
		return nil, err // Return error if decoding fails
	}
	return dec, nil // Return the decoded byte slice
}

// CreateUserImgFromBytes accepts a byte slice representing an image, along with the userID and image type.
// It checks if the image type is valid, then saves it to a file with the user's ID as the file name.
// If the file is successfully created and saved, the file name is returned. If any error occurs, it is returned.
func CreateUserImgFromBytes(bytes []byte, userID, imgType string) (string, error) {
	// Detect the MIME type of the image from the byte slice
	mimeType := http.DetectContentType(bytes)
	// Extract the file extension from the MIME type
	fileExtension := strings.Split(mimeType, "/")
	if fileExtension[0] != "image" {
		return "", errors.New("invalid file type as profile img") // Ensure the file is an image
	}
	// Define the file name using the user ID and image extension
	fileName := userID + "." + fileExtension[1]
	// Create the file in the specified directory
	f, err := os.Create("data/img/profile/" + fileName)
	if err != nil {
		return "", err // Return error if file creation fails
	}
	defer f.Close() // Ensure the file is closed when the function exits

	// Write the image bytes to the file
	if _, err := f.Write(bytes); err != nil {
		return "", err // Return error if writing to file fails
	}
	// Synchronize the file to ensure all data is written
	if err := f.Sync(); err != nil {
		return "", err // Return error if syncing fails
	}
	// Return the generated file name
	return fileName, nil
}

// CreateImgFromBytes accepts a byte slice representing an image, an ID, image type, and content type.
// It checks if the image type is valid, then saves the image to a file in a specified content-type subdirectory.
// If the file is successfully created and saved, the file name is returned. If any error occurs, it is returned.
func CreateImgFromBytes(bytes []byte, ID, imgType, contentType string) (string, error) {
	// Detect the MIME type of the image from the byte slice
	mimeType := http.DetectContentType(bytes)
	// Extract the file extension from the MIME type
	fileExtension := strings.Split(mimeType, "/")
	if fileExtension[0] != "image" {
		return "", errors.New("invalid file type as img") // Ensure the file is an image
	}
	// Define the file name using the ID and image extension
	fileName := ID + "." + fileExtension[1]
	// Create the file in the specified subdirectory based on content type
	f, err := os.Create(fmt.Sprintf("data/img/%s/%s", contentType, fileName))
	if err != nil {
		return "", err // Return error if file creation fails
	}
	defer f.Close() // Ensure the file is closed when the function exits

	// Write the image bytes to the file
	if _, err := f.Write(bytes); err != nil {
		return "", err // Return error if writing to file fails
	}
	// Synchronize the file to ensure all data is written
	if err := f.Sync(); err != nil {
		return "", err // Return error if syncing fails
	}
	// Return the generated file name
	return fileName, nil
}
