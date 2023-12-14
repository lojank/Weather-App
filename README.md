# React Weather App

This is a simple React application that fetches weather data based on the user's location using the OpenWeatherMap API.

## Features

- Retrieves user's geolocation coordinates
- Fetches current weather data based on latitude and longitude
- Displays current weather information including temperature, description, wind speed, and location

## Prerequisites

Before running the application, you'll need:

- Node.js installed on your machine
- OpenWeatherMap API key (sign up at [OpenWeatherMap](https://openweathermap.org/) to get the API key)

## Installation

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your OpenWeatherMap API key:
   - Open `App.tsx` and replace `const YOUR_API_KEY = "";` with your API key.

## Usage

Run the application locally:`npm start`

Access the application in your browser at `http://localhost:3000`.

## Components

### `App.tsx`

- Main component handling API calls and rendering weather components.

### `CurrentWeather.tsx`

- Component displaying current weather details like temperature, description, and wind speed.

### `WeatherInfo.tsx`

- Component showing additional weather information.

### `WeatherLocation.tsx`

- Component displaying the location name.

### `Error.tsx`

- Component handling error messages when fetching weather data or geolocation.
