import axios from "axios";

const API_ENDPOINT = "https://localhost:5000";
console.log("API Endpoint:", API_ENDPOINT);

/**
 * Wrapper for API calls with axios.
 * @param {string} path - The API endpoint path (relative to API base URL).
 * @param {string} method - The HTTP method (e.g., GET, POST, etc.).
 * @param {Object} body - The request payload (optional).
 * @param {Object} headers - Additional request headers (optional).
 * @returns {Promise<Object>} - Resolves with JSON response or rejects with error.
 */
export const apiRequest = async (path, method, body, headers = {}) => {
  try {
    const response = await axios({
      url: `${API_ENDPOINT}${path}`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      data: body, // Axios handles null/undefined data automatically
      withCredentials: true, // Ensures cookies are sent with the request
    });

    return response.data; // Axios responses include the data in a 'data' field
  } catch (error) {
    // Extract meaningful error messages
    const errorMessage =
      error.response?.data?.error || error.message || "Something went wrong";
    throw new Error(errorMessage);
  }
};
