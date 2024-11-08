# Weather App

A web application that provides weather information based on user input or current location. It utilizes OpenWeatherMap API to retrieve weather data and stores recent search history.

## Features

- **Search by Location:** Get weather updates by entering city and country.
- **Current Location Weather:** Retrieve weather information for your current location.
- **Search History:** Stores recent searches and allows users to revisit past locations.

## Tech Stack

- **Frontend:** React, TypeScript, CSS
- **Backend:** Flask, Python, SQLite

## Prerequisites

- Python 3.x
- Node.js and npm
- SQLite
- OpenWeatherMap API Key (sign up at [OpenWeatherMap](https://openweathermap.org/))

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Install dependencies for Flask:
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. Set up the SQLite database:
   ```
   sqlite3 weather_app.db < user_session.sql
   sqlite3 weather_app.db < user_uuids.sql
   ```
4. Set up your OpenWeatherMap API key in app.py:
   ```
   YOUR_API_KEY = "your_openweathermap_api_key"
   ```
5. Run the Flask server:
   ```
   python app.py
   ```
6. In a separate terminal, navigate to the frontend directory, install dependencies, and start the React app:
   ```
   npm install
   npm start
   ```

## API Endpoints

`/weather` **[GET]**

Fetches weather data for the specified location by latitude/longitude or city/country.

- **Parameters**:
   - `lat`: Latitude
   - `lon`: Longitude
   - `city`: City name
   - `country`: Country name
   - `user_uuid`: User UUID
 
`/search-history` **[GET]**

Retrieves the user’s recent search history.
- **Parameters**:
   - `user_uuid`: User UUID
 
`/update-search-history` **[POST]**

Updates the user’s search history with new entries.
- **Body**: JSON containing `city` and `country`
- **Parameter**:
   - `user_uuid`: User UUID
 
`/get-uuid` **[GET]**

Generates a new UUID for new users.

## Usage

- Access the application in your browser at `http://localhost:3000`.
- Use the sidebar to search for weather by city and country, or click the location icon to get current location weather.
- The recent search history section displays up to 8 recent searches.
