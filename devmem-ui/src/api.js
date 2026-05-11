// Base URL of backend
const BASE_URL = "https://devmem-api-ach7bfach7bjc9au.canadacentral-01.azurewebsites.net";

// ✅ Common fetch handler
const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // 🔥 HANDLE NON-200 RESPONSES
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} - ${text}`);
    }

    return await response.json();

  } catch (error) {
    console.error("🔥 API FAILED:", error);
    throw error;
  }
};

// ✅ API methods
export const get = (url, options = {}) =>
  request(url, { method: "GET", ...options });

export const post = (url, body, options = {}) =>
  request(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

export const put = (url, body, options = {}) =>
  request(url, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });

export const del = (url, options = {}) =>
  request(url, { method: "DELETE", ...options });

export default BASE_URL;