from flask import Flask, request, send_from_directory, jsonify, abort
from flask_cors import CORS
import os
from database import Database

from multiturn import run_web_prompt

class HooHacksApp:
    def __init__(self):
        self.app = Flask(__name__, static_folder="medLama/out", static_url_path="/")
        CORS(self.app)
        self.database = Database()
        self.setup_routes()

    def setup_routes(self):
        @self.app.route('/')
        def index():
            index_path = os.path.join(self.app.static_folder, "index.html")
            return send_from_directory(self.app.static_folder, "index.html") if os.path.exists(index_path) else abort(404)

        @self.app.route('/api/doctors/')
        def get_doctors():
            specialty = request.args.get('specialty', type=str, default=None)
            latitude = request.args.get('latitude', type=float)
            longitude = request.args.get('longitude', type=float)

            if latitude is None or longitude is None:
                return "Request must contain latitude and longitude", 400

            return jsonify(self.database.get_doctors(latitude, longitude, specialty))

        @self.app.route('/api/health-centers/')
        def get_health_centers():
            latitude = request.args.get('latitude', type=float)
            longitude = request.args.get('longitude', type=float)

            if latitude is None or longitude is None:
                return "Request must contain latitude and longitude", 400

            return jsonify(self.database.get_health_centers(latitude, longitude))

        @self.app.route('/api/llm/response/')
        def prompt():
            message = request.args.get("message", type=str, default="")
            return jsonify(run_web_prompt(message))

        @self.app.route('/api/llm/delete/')
        def delete_conversation():
            return jsonify(run_web_prompt("exit"))

        @self.app.route('/<path:path>')
        def serve_static_files(path):
            file_path = os.path.join(self.app.static_folder, path)
            return send_from_directory(self.app.static_folder, path) if os.path.exists(file_path) else self.index()

    def run(self, host="0.0.0.0", port=5000, debug=False):
        self.app.run(host="127.0.0.1" if debug else host, port=port, debug=debug)


app = HooHacksApp().app

if __name__ == "__main__":
    HooHacksApp().run()
