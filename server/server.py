from flask import Flask, request, jsonify
import util

# Flask also serves the frontend (the client folder)
app = Flask(__name__, static_folder='../client', static_url_path='')

# Load the model when the module is imported, so it also works under gunicorn
util.load_saved_artifacts()

@app.route('/')
def home():
    return app.send_static_file('app.html')

@app.route('/get_location_names', methods=['GET'])
@app.route('/api/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_home_price', methods=['GET', 'POST'])
@app.route('/api/predict_home_price', methods=['GET', 'POST'])
def predict_home_price():
    total_sqft = float(request.form['total_sqft'])
    location = request.form['location']
    bhk = int(request.form['bhk'])
    bath = int(request.form['bath'])

    response = jsonify({
        'estimated_price': util.get_estimated_price(location,total_sqft,bhk,bath)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Predicition ..")
    app.run()