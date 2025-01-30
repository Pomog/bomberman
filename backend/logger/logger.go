package logger

import (
	"log"
	"os"
	"reflect"
	"runtime"
)

// Predefined loggers for different log levels
var (
	// Info logs general application messages (printed to stdout)
	Info = log.New(os.Stdout, "INFO - App: ", log.Ldate|log.Ltime).Printf
	// Warning logs warnings with file and line number (printed to stdout)
	Warning = log.New(os.Stdout, "WARNING - App: ", log.Ldate|log.Ltime|log.Lshortfile).Printf
	// Error logs errors with file and line number (printed to stderr)
	Error = log.New(os.Stderr, "ERROR - App: ", log.Ldate|log.Ltime|log.Lshortfile).Println
)

// CreateLoggers initializes separate loggers for errors and general info logging
// - Errors are logged to stderr
// - Info logs are written to `info.log`, or stdout if the file cannot be opened
func CreateLoggers() (errLog, infoLog *log.Logger) {
	// Initialize error logger (logs to stderr with microseconds precision)
	errLog = log.New(os.Stderr, "ERROR - App: ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)

	// Try to open `info.log` file for writing logs
	infoLogFile, err := os.OpenFile("info.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0o664)
	if err != nil {
		// If the log file cannot be opened, log the error and use stdout instead
		errLog.Printf("Cannot open log file: %s\nUsing stdout for info logs instead.", err)
		infoLogFile = os.Stdout
	}

	// Initialize info logger
	infoLog = log.New(infoLogFile, "INFO - App:  ", log.Ldate|log.Ltime|log.Lmicroseconds)
	return
}

// GetFunctionName returns the function name of a given function reference
func GetFunctionName(i interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

// GetCurrentFuncName returns the name of the function that called it
func GetCurrentFuncName() string {
	pc, _, _, _ := runtime.Caller(1) // Get the program counter of the calling function
	return runtime.FuncForPC(pc).Name()
}
