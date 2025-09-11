const API_URL ='https://localhost:7213';

interface TokenRequestBody {
  id: string;
  role: string;
  name: string;
  image?: string | null;
}

export const streamService = {
  getToken: async (userData: TokenRequestBody) => {
    try {
      const res = await fetch(`${API_URL}/api/stream/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch Stream token");
      }

      const data = await res.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching stream token:", error);
      throw error;
    }
  }
};
