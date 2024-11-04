from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import requests
import pycountry
import sqlite3
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow CORS for specified origin

YOUR_API_KEY = "3780d23910d077915dcd2f94100efb7d"  # OpenWeather API key

# Establishes a connection to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('weather_app.db')
    conn.row_factory = sqlite3.Row  # Returns rows as dictionaries for easy access
    return conn

# Converts a full country name to its ISO alpha-2 country code for OpenWeather API requests
def get_country_code(country_name):
    try:
        return pycountry.countries.lookup(country_name).alpha_2
    except LookupError:
        return None

# Route to fetch current weather based on coordinates or city and country
@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    city = request.args.get('city')
    country = request.args.get('country')
    user_uuid = request.args.get('user_uuid')  # Retrieves user UUID

    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400  # Return error if UUID is missing

    # Build URL based on provided coordinates or city/country
    if lat and lon:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={YOUR_API_KEY}"
    elif city and country:
        country_code = get_country_code(country)
        if country_code is None:
            return jsonify({"error": "Invalid country name"}), 400
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city},{country_code}&appid={YOUR_API_KEY}"
    else:
        return jsonify({"error": "Either latitude/longitude or city/country is required"}), 400

    # Fetches weather data from OpenWeather API
    response = requests.get(url)
    if response.status_code == 200:
        weather_data = response.json()

        # Save search details to the database if city and country are provided
        if city and country:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO user_sessions (uuid, city, country) VALUES (?, ?, ?)',
                (user_uuid, city, country)
            )
            conn.commit()
            conn.close()

        return jsonify(weather_data)  # Return weather data if API call is successful
    else:
        return jsonify({"error": "Failed to fetch weather data"}), response.status_code

# Route to retrieve search history for a specific user
@app.route('/search-history', methods=['GET'])
def get_search_history():
    user_uuid = request.args.get('user_uuid')  # Retrieves user UUID

    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400

    conn = get_db_connection()
    # Fetch unique search records, ordered by the latest timestamp
    searches = conn.execute(
        '''
        SELECT DISTINCT city, country, MAX(timestamp) as latest_timestamp 
        FROM user_sessions 
        WHERE uuid = ? 
        GROUP BY city, country 
        ORDER BY latest_timestamp DESC 
        LIMIT 8
        ''',
        (user_uuid,)
    ).fetchall()
    conn.close()

    # Format the results as a list of dictionaries
    search_list = [{"city": search["city"], "country": search["country"]} for search in searches]

    return jsonify({"searches": search_list})

# Route to update the search history when a new city and country are searched
@app.route('/update-search-history', methods=['POST'])
def update_search_history():
    user_uuid = request.args.get('user_uuid')  # Retrieves user UUID
    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400

    new_search = request.json
    city = new_search.get('city')
    country = new_search.get('country')

    # Save the new search entry to the database
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO user_sessions (uuid, city, country) VALUES (?, ?, ?)',
        (user_uuid, city, country)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Search history updated successfully"}), 200

# Checks if the UUID is older than 1 hour, indicating it has expired
def is_uuid_expired(user_uuid):
    conn = get_db_connection()
    result = conn.execute('SELECT created_at FROM user_uuids WHERE uuid = ?', (user_uuid,)).fetchone()
    conn.close()

    if result:
        created_at = datetime.strptime(result["created_at"], "%Y-%m-%d %H:%M:%S")
        # Checks if UUID was created over an hour ago
        if datetime.now() - created_at > timedelta(hours=1):
            return True
    return False

# Route to generate and return a new UUID for new users or if the UUID has expired
@app.route('/get-uuid', methods=['GET'])
def get_uuid():
    user_uuid = request.args.get('user_uuid')  # Retrieve existing UUID if available

    if user_uuid and not is_uuid_expired(user_uuid):
        return jsonify({"uuid": user_uuid})

    # Generate a new UUID if none exists or if the existing one is expired
    new_uuid = str(uuid.uuid4())

    # Store the new UUID with the current timestamp in the database
    conn = get_db_connection()
    conn.execute(
        'INSERT OR REPLACE INTO user_uuids (uuid, created_at) VALUES (?, ?)',
        (new_uuid, datetime.now())
    )
    conn.commit()
    conn.close()

    return jsonify({"uuid": new_uuid})

# Main method to start server
if __name__ == '__main__':
    app.run(debug=True)
