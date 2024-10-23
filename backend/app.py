from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import requests
import pycountry
import sqlite3
import uuid

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

YOUR_API_KEY = "";

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
    user_uuid = request.args.get('user_uuid')  # Get UUID from query params

    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400

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

    response = requests.get(url)
    if response.status_code == 200:
        weather_data = response.json()

        # Save the search if city and country are provided
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


@app.route('/search-history', methods=['GET'])
def get_search_history():
    user_uuid = request.args.get('user_uuid')  # Get UUID from query params

    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400

    conn = get_db_connection()
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

    search_list = [{"city": search["city"], "country": search["country"]} for search in searches]

    return jsonify({"searches": search_list})


@app.route('/update-search-history', methods=['POST'])
def update_search_history():
    user_uuid = request.args.get('user_uuid')  # Get UUID from query params
    if not user_uuid:
        return jsonify({"error": "No user UUID provided"}), 400

    new_search = request.json
    city = new_search.get('city')
    country = new_search.get('country')

    # Save the search to the database
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO user_sessions (uuid, city, country) VALUES (?, ?, ?)',
        (user_uuid, city, country)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Search history updated successfully"}), 200

# Generate UUID for new users and return it to the frontend
@app.route('/get-uuid', methods=['GET'])
def get_uuid():
    user_uuid = str(uuid.uuid4())
    return jsonify({"uuid": user_uuid})


if __name__ == '__main__':
    app.run(debug=True)
