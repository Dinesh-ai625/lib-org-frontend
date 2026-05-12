const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:8080/api"
    : "https://lib-org-backend-production.up.railway.app/api";

export default API_BASE_URL;
