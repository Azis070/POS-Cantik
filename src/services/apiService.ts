import { UserProfile, Child, Measurement, UserRole } from "../types";

const API_URL = typeof window !== 'undefined' ? window.location.origin : "";

export const api = {
  async getData() {
    try {
      const res = await fetch(`${API_URL}/api/data`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (getData):", error);
      throw error;
    }
  },

  async saveUser(user: UserProfile) {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("API Error (saveUser):", error);
      throw error;
    }
  },

  async updateUser(uid: string, updates: Partial<UserProfile>) {
    try {
      const res = await fetch(`${API_URL}/api/users/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, updates })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (updateUser):", error);
      throw error;
    }
  },

  async deleteUser(uid: string) {
    try {
      const res = await fetch(`${API_URL}/api/users/${uid}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (deleteUser):", error);
      throw error;
    }
  },

  async saveChild(child: Child) {
    try {
      const res = await fetch(`${API_URL}/api/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(child)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (saveChild):", error);
      throw error;
    }
  },

  async saveMeasurement(measurement: Measurement) {
    try {
      const res = await fetch(`${API_URL}/api/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurement)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (saveMeasurement):", error);
      throw error;
    }
  },

  async deleteChild(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/children/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (deleteChild):", error);
      throw error;
    }
  },

  async deleteMeasurement(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/measurements/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (deleteMeasurement):", error);
      throw error;
    }
  },

  async savePosyandus(posyandus: string[]) {
    try {
      const res = await fetch(`${API_URL}/api/posyandus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posyandus)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("API Error (savePosyandus):", error);
      throw error;
    }
  }
};
