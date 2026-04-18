import { API_BASE_URL } from '../utils/constants.ts';

/**
 * Utility function to convert an object into a URL query string.
 * Ignores properties that are undefined, null, or empty strings.
 */
const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Sensor
export const fetchSensorDataAPI = async (params?: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/sensors/data${buildQueryString(params)}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// Action History
export const fetchHistoryDataAPI = async (params?: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/history${buildQueryString(params)}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// Device Control
export const controlDeviceAPI = async (device_id: string, action: string) => {
  const response = await fetch(`${API_BASE_URL}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id, action }),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// Devices Status
export const fetchDevicesStatusAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/devices`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};