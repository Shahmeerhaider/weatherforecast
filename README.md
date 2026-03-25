# Weather Dashboard Web Application

## Project Overview
A responsive weather dashboard web application that allows users to search for real-time weather data by city. The application fetches data from a free weather API, validates user input, displays weather information dynamically, and maintains search history.

## API Information

### Selected API: Open-Meteo (https://open-meteo.com)

**Why Open-Meteo?**
- Completely free with no API key required
- No registration needed
- Fast and reliable responses
- Open-source and well-maintained
- Provides accurate weather data worldwide
- CORS enabled for browser-based applications

### API Endpoints Used

#### 1. Geocoding API
Converts city names to geographic coordinates.
- **Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`
- **Parameters:**
  - `name`: City name to search
  - `count`: Number of results (set to 1)
  - `format`: JSON format
- **Response Fields Used:**
  - `results[0].latitude`: City latitude
  - `results[0].longitude`: City longitude
  - `results[0].name`: Official city name

#### 2. Weather API
Fetches current weather data using coordinates.
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Parameters:**
  - `latitude`: City latitude from geocoding
  - `longitude`: City longitude from geocoding
  - `current_weather`: Include current weather data
  - `hourly`: Request hourly humidity data
- **Response Fields Used:**
  - `current_weather.temperature`: Temperature in Celsius
  - `current_weather.weathercode`: Weather condition code
  - `hourly.relativehumidity_2m[0]`: Current humidity percentage

### Weather Code Mapping
Open-Meteo uses WMO weather codes. The application maps these codes to readable conditions:
- Code 0: Clear sky
- Codes 1-3: Partly cloudy to overcast
- Codes 45-48: Foggy
- Codes 51-55: Drizzle
- Codes 61-65: Rain
- Codes 71-75: Snow
- Codes 80-82: Rain showers
- Codes 95-99: Thunderstorm

## Features Implemented

### Core Features
- **City Search Form**
  - Bootstrap-based form with text input and search button
  - Real-time input validation
  - Error messages for invalid input
  - Visual feedback with red/green borders

- **Weather Data Fetching**
  - AJAX requests using jQuery
  - JSON response parsing
  - Loading indicator during API calls
  - Error handling for network issues and invalid cities

- **Weather Display**
  - Bootstrap cards for clean presentation
  - Font Awesome icons for visual appeal
  - Temperature in Celsius
  - Weather condition with description
  - Humidity percentage
  - Current date and time
  - Last updated timestamp

### Built-in JavaScript Functions
- **Number Methods**
  - `Math.round()` for temperature rounding
  - Kelvin to Celsius conversion (API returns Celsius directly)

- **String Methods**
  - `toUpperCase()` and `toLowerCase()` for capitalization
  - `trim()` for input cleaning
  - `split()` and `join()` for word manipulation
  - Regular expressions for input validation

- **Array Methods**
  - `push()` and `unshift()` for history management
  - `findIndex()` for duplicate detection
  - `splice()` for removing items
  - `forEach()` for rendering history
  - `pop()` for limiting history size

- **Date Methods**
  - `new Date()` for current date/time
  - `toLocaleDateString()` for formatted dates
  - `toLocaleTimeString()` for formatted times

### DOM & Style Manipulation
- **Dynamic Background**
  - Sunny weather: Yellow/Orange gradient
  - Rainy weather: Blue gradient
  - Cloudy weather: Gray gradient
  - Dark mode variants for all weather types

- **UI Interactions**
  - Highlight searched city with yellow border
  - Toggle Dark/Light mode with localStorage persistence
  - Hover effects on cards and history items
  - Smooth transitions and animations

### Search History
- Stores up to 8 recent searches
- Saves to localStorage for persistence
- Displays as clickable list
- Click to re-search any city
- Clear history button
- No duplicate entries (moves to top)

### Bootstrap UI Components
- Responsive grid system (col-12, col-md-8, col-lg-6)
- Navbar with brand and dark mode toggle
- Cards for search form and weather display
- List group for search history
- Buttons with hover effects
- Alerts for error messages
- Mobile-responsive layout

## File Structure
