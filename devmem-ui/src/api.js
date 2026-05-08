// Base URL of your deployed backend (Azure App Service)
const BASE_URL = "https://devmem-api-ach7bfach7bjc9au.canadacentral-01.azurewebsites.net"

// Helper functions (optional but recommended)
export const get = (url, options = {}) => {
  return fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
};

export const post = (url, body, options = {}) => {
  return fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
};

export const put = (url, body, options = {}) => {
  return fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
};

export const del = (url, options = {}) => {
  return fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
};

// Default export (for direct usage if needed)
export default BASE_URL;