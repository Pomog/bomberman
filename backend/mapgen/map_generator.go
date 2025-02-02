package mapgen

import (
	"math/rand"
	"time"
)

// DefaultRandomMapGenerator is the main function used to generate a randomized game map.
// It uses a predefined `baseMap` as the template and `charSet` to determine which tiles
// will replace certain elements in the base map. This function acts as a wrapper around
// `randomMapGenerator`, providing default values.
func DefaultRandomMapGenerator() string {
	return randomMapGenerator(baseMap, charSet)
}

// baseMap represents the initial structure of the game map.
// The map is 11 rows by 17 columns, using specific characters to define different tiles:
//
// - 'S' (SPAWN): A designated spawn area, which must always remain grass ('G').
// - 'B' (SOLID): Indestructible blocks, such as the game boundary.
// - 'G' (GRASS): Grass tiles, which can be replaced by destructible blocks during randomization.
const baseMap = ("BBBBBBBBBBBBBBBBB" +
	"BSSGGGGGGGGGGGSSB" +
	"BSBGBGBGBGBGBGBSB" +
	"BGGGGGSGGGGGGGGGB" +
	"BGBGBGBGBGBGBGBGB" +
	"BGGGGGGGGSGGGGGGB" +
	"BGBGBGBGBGBGBGBGB" +
	"BGGGSSGGGGSGGGGGB" +
	"BSBGBGBGBGBGBGBSB" +
	"BSSGGGGGGGGGGGSSB" +
	"BBBBBBBBBBBBBBBBB")

// charSet defines the possible replacement tiles for grass ('G') blocks in the `baseMap`.
// It includes the following tiles:
//
// - 'G' (GRASS): The default grass tile, which remains unchanged.
// - 'D' (DBLOCK): A destroyable block that can be broken during gameplay.
// - 'O' (DBLOCKBOMB): A destroyable block that drops a bomb powerup when destroyed.
// - 'F' (DBLOCKFLAME): A destroyable block that drops a flame powerup when destroyed.
// - 'M' (DBLOCKSPEED): A destroyable block that drops a movement speed powerup when destroyed.
//
// Adjusting the frequency of characters in `charSet` will influence the probability of different blocks appearing.
const charSet = "GGGDDDDDOFM"

// randomMapGenerator takes a `baseMap` template and replaces certain tiles ('G') with randomly chosen elements
// from `charSet`. It ensures that spawn areas ('S') always remain grass ('G').
func randomMapGenerator(baseMap string, charSet string) (randomMap string) {
	randomMap = ""
	for i := 0; i < len(baseMap); i++ {
		currentChar := string(baseMap[i])
		switch currentChar {
		case "G":
			// Replace 'G' (grass) with a randomly selected character from charSet
			randomMap += stringWithCharset(1, charSet)
		case "S":
			// Spawn areas must remain grass ('G')
			randomMap += "G"
		default:
			// Keep other characters (e.g., 'B') unchanged
			randomMap += currentChar
		}
	}
	return randomMap
}

// seededRand is a global random number generator seeded with the current time.
// This ensures that each map generation produces different results.
var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

// stringWithCharset generates a random string of the specified length using characters from `charset`.
// In this case, it is used to randomly replace 'G' tiles in the base map with elements from `charSet`.
func stringWithCharset(length int, charset string) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))] // Select a random character from `charset`
	}
	return string(b)
}
