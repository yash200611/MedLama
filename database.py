import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from pymongo.server_api import ServerApi

class Database:
    def __init__(self):
        try:
            # Get MongoDB connection string from environment or use default
            connection_string = os.environ.get("database-connection-string", "mongodb://localhost:27017/")
            if connection_string == "test" or not connection_string:
                # Use mock data for development
                self.client = None
                self.database = None
                print("Using mock database for development")
            else:
                self.client = MongoClient(connection_string, server_api=ServerApi('1'))
                self.database = self.client.get_database("main")
        except Exception as e:
            print(f"---ERROR--- Failed to connect to MongoDB: {e}")
            self.client = None
            self.database = None

    def ping(self):
        if not self.client:
            return "Database connection not initialized."
        try:
            self.client.admin.command('ping')
            return "Database connection successful!"
        except ConnectionFailure as e:
            return f"---ERROR--- Database connection failed: {e}"

    def get_doctors(self, latitude, longitude, specialty=None):
        if latitude is None or longitude is None:
            return "Request must contain latitude and longitude", 400

        # If no database connection, return mock data
        if not self.database:
            mock_doctors = [
                {
                    "name": "Dr. Sarah Johnson",
                    "specialty": "Cardiology",
                    "phone": "(555) 123-4567",
                    "email": "sarah.johnson@hospital.com",
                    "latitude": latitude + 0.01,
                    "longitude": longitude + 0.01,
                    "distance": 0.014
                },
                {
                    "name": "Dr. Michael Chen",
                    "specialty": "Internal Medicine",
                    "phone": "(555) 234-5678",
                    "email": "michael.chen@clinic.com",
                    "latitude": latitude - 0.02,
                    "longitude": longitude + 0.01,
                    "distance": 0.022
                },
                {
                    "name": "Dr. Emily Rodriguez",
                    "specialty": "Emergency Medicine",
                    "phone": "(555) 345-6789",
                    "email": "emily.rodriguez@emergency.com",
                    "latitude": latitude + 0.01,
                    "longitude": longitude - 0.02,
                    "distance": 0.022
                }
            ]
            
            if specialty:
                mock_doctors = [doc for doc in mock_doctors if specialty.lower() in doc["specialty"].lower()]
            
            return mock_doctors

        parameters = {
            "latitude": { "$lt": latitude + 0.1, "$gt": latitude - 0.1 },
            "longitude": { "$lt": longitude + 0.1, "$gt": longitude - 0.1 },
        }

        if specialty:
            regex_conditions = [{"specialty": {"$regex": word, "$options": "i"}} for word in specialty.split()]
            parameters["$or"] = regex_conditions

        query = self.database.doctors.find(
            parameters,
            {"_id": 0}
        )

        doctors = []
        for doctor in query:
            doctor["distance"] = ((doctor["latitude"] - latitude) ** 2 + (doctor["longitude"] - longitude) ** 2) ** 0.5
            doctors.append(doctor)
        doctors.sort(key=lambda x: x["distance"])

        return doctors

    def get_health_centers(self, latitude, longitude):
        if latitude is None or longitude is None:
            return "Request must contain latitude and longitude", 400

        # If no database connection, return mock data
        if not self.database:
            mock_centers = [
                {
                    "name": "City General Hospital",
                    "address": "123 Main St, City, State 12345",
                    "phone": "(555) 111-2222",
                    "latitude": latitude + 0.02,
                    "longitude": longitude + 0.01,
                    "distance": 0.022
                },
                {
                    "name": "Community Health Center",
                    "address": "456 Oak Ave, City, State 12345",
                    "phone": "(555) 333-4444",
                    "latitude": latitude - 0.01,
                    "longitude": longitude + 0.02,
                    "distance": 0.022
                },
                {
                    "name": "Emergency Care Clinic",
                    "address": "789 Pine St, City, State 12345",
                    "phone": "(555) 555-6666",
                    "latitude": latitude + 0.01,
                    "longitude": longitude - 0.01,
                    "distance": 0.014
                }
            ]
            return mock_centers

        parameters = {
            "latitude": { "$lt": latitude + 0.1, "$gt": latitude - 0.1 },
            "longitude": { "$lt": longitude + 0.1, "$gt": longitude - 0.1 },
        }

        query = self.database.health_centers.find(
            parameters,
            {"_id": 0}
        )

        health_centers = []
        for health_center in query:
            health_center["distance"] = ((health_center["latitude"] - latitude) ** 2 + (health_center["longitude"] - longitude) ** 2) ** 0.5
            health_centers.append(health_center)
        health_centers.sort(key=lambda x: x["distance"])

        return health_centers