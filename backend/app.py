from flask import Flask, jsonify, request, session
from flask_cors import CORS
import requests
import pycountry
import sqlite3
import uuid

app = Flask(__name__)
app.secret_key = "your_secret_key"  # Required for session management

# Allow CORS for specific origins
CORS(app, resources={r"/weather": {"origins": "http://localhost:3000"}})

# OpenWeatherMap API key
YOUR_API_KEY = ""

# Connect to SQLite database
def get_db_connection():
    conn = sqlite3.connect('weather_app.db')
    conn.row_factory = sqlite3.Row
    return conn

# Convert full country name to ISO 3166-1 alpha-2 country code
def get_country_code(country_name):
    try:
        return pycountry.countries.lookup(country_name).alpha_2
    except LookupError:
        return None

@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    city = request.args.get('city')
    country = request.args.get('country')

    # Generate a unique user ID if it doesn't exist
    if 'user_uuid' not in session:
        session['user_uuid'] = str(uuid.uuid4())

    user_uuid = session['user_uuid']  # Get user's unique identifier

    # Fetch weather by coordinates (lat, lon)
    if lat and lon:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={YOUR_API_KEY}"
    elif city and country:
        country_code = get_country_code(country)
        if country_code is None:
            return jsonify({"error": "Invalid country name"}), 400
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city},{country_code}&appid={YOUR_API_KEY}"
    else:
        return jsonify({"error": "Either latitude/longitude or city/country is required"}), 400

    # Make request to OpenWeatherMap API
    response = requests.get(url)
    if response.status_code == 200:
        weather_data = response.json()

        # Only save the search if city and country are provided (i.e., not from lat/lon)
        if city and country:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO user_sessions (uuid, city, country) VALUES (?, ?, ?)',
                (user_uuid, city, country)
            )
            conn.commit()
            conn.close()

        return jsonify(weather_data)
    else:
        return jsonify({"error": "Failed to fetch weather data"}), response.status_code


# Retrieve user search history
@app.route('/search-history', methods=['GET'])
def get_search_history():
    if 'user_uuid' not in session:
        return jsonify({"error": "No search history available"}), 404

    user_uuid = session['user_uuid']
    conn = get_db_connection()
    searches = conn.execute(
        'SELECT city, country, timestamp FROM user_sessions WHERE uuid = ? ORDER BY timestamp DESC LIMIT 8',
        (user_uuid,)
    ).fetchall()
    conn.close()

    search_list = [{"city": search["city"], "country": search["country"], "timestamp": search["timestamp"]}
                   for search in searches]

    return jsonify({"searches": search_list})


if __name__ == '__main__':
    app.run(debug=True)
