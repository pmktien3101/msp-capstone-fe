interface TokenResponse {
  token: string;
}

class TokenService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = "https://localhost:7213/api";
  }

  async getStreamToken(user: {
    id: string;
    name: string;
    image: string;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/stream/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          role: "user",
          image: user.image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get stream token");
      }

      const data: TokenResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error getting stream token:", error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();
