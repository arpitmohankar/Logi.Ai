from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime
from geopy.distance import geodesic
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load ML models
xgb_model = joblib.load('models/xgboost_traffic_predictor.pkl')
scaler = joblib.load('models/feature_scaler.pkl')

# Feature columns (must match training)
feature_columns = ['origin_lat', 'origin_lon', 'dest_lat', 'dest_lon',
                  'straight_line_distance', 'temperature', 'humidity',
                  'wind_speed', 'visibility', 'precipitation',
                  'hour_of_day', 'day_of_week', 'is_weekend']

def get_weather_data(lat, lon):
    """Get weather data for location"""
    # Implementation from your friend's code
    # Returns weather dict
    pass

def predict_travel_time(origin_coords, dest_coords):
    """Predict travel time using XGBoost"""
    weather = get_weather_data(origin_coords[0], origin_coords[1])
    straight_distance = geodesic(origin_coords, dest_coords).km
    current_time = datetime.now()
    
    features = {
        'origin_lat': origin_coords[0],
        'origin_lon': origin_coords[1],
        'dest_lat': dest_coords[0],
        'dest_lon': dest_coords[1],
        'straight_line_distance': straight_distance,
        'temperature': weather.get('temperature', 28),
        'humidity': weather.get('humidity', 75),
        'wind_speed': weather.get('wind_speed', 10),
        'visibility': weather.get('visibility', 10),
        'precipitation': weather.get('precipitation', 0),
        'hour_of_day': current_time.hour,
        'day_of_week': current_time.weekday(),
        'is_weekend': current_time.weekday() >= 5
    }
    
    X = pd.DataFrame([features])[feature_columns]
    X_scaled = scaler.transform(X)
    predicted_time = xgb_model.predict(X_scaled)[0]
    
    return float(predicted_time)

class GeneticAlgorithmTSP:
    """Genetic Algorithm implementation from friend's code"""
    # Copy the implementation
    pass

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model': 'loaded'})

@app.route('/optimize-route', methods=['POST'])
def optimize_route():
    try:
        data = request.json
        deliveries = data['deliveries']  # List of {lat, lng, id}
        starting_point = data['startingPoint']  # {lat, lng}
        
        # Create distance/time matrix
        n = len(deliveries) + 1
        time_matrix = np.zeros((n, n))
        
        # Build time matrix using ML predictions
        all_points = [starting_point] + deliveries
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    time_matrix[i][j] = 0
                else:
                    origin = (all_points[i]['lat'], all_points[i]['lng'])
                    dest = (all_points[j]['lat'], all_points[j]['lng'])
                    time_matrix[i][j] = predict_travel_time(origin, dest)
        
        # Run genetic algorithm
        ga = GeneticAlgorithmTSP(time_matrix, {})
        best_route, best_time, _, _ = ga.optimize(
            population_size=100,
            generations=50,
            verbose=False
        )
        
        # Build response
        optimized_deliveries = []
        for idx in best_route:
            optimized_deliveries.append(deliveries[idx - 1])
        
        return jsonify({
            'success': True,
            'optimizedRoute': {
                'deliveries': optimized_deliveries,
                'totalTime': best_time,
                'totalDistance': best_time * 0.4,  # Rough estimate
                'sequence': best_route
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
