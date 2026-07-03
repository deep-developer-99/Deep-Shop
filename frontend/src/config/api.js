const localApiBaseUrl = "http://localhost:5000";
const productionApiBaseUrl = "https://deep-shop.onrender.com";

const apiBaseUrl = (() => {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL || "").replace(
    /\/$/,
    "",
  );

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return localApiBaseUrl;
  }

  return productionApiBaseUrl;
})();

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (apiBaseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${apiBaseUrl}${normalizedPath.slice(4)}`;
  }

  return `${apiBaseUrl}${normalizedPath}`;
};
