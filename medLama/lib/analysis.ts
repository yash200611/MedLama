import {Doctor, EmergencyFacility} from "./types";

export async function findAvailableDoctors(specialty: string, latitude: number = 38.02931000, longitude: number = -78.47668000): Promise<Doctor[]> {
  try {
    const res = await fetch(`/api/doctors/?latitude=${latitude}&longitude=${longitude}&specialty=${specialty}`);
    return await res.json();
  } catch (err) {
    console.log(err);
  }
  return [];
}

export async function findNearbyHospitals(latitude: number = 38.02931000, longitude: number = -78.47668000): Promise<EmergencyFacility[]> {
  try {
    const res = await fetch(`/api/health-centers/?latitude=${latitude}&longitude=${longitude}`);
    return await res.json();
  } catch (err) {
    console.log(err);
  }
  return [];
}