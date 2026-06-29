const PRODUCTION_API_URL =
  "https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api";

const DEVELOPMENT_API_URL = "http://localhost:3001/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? DEVELOPMENT_API_URL
    : PRODUCTION_API_URL);