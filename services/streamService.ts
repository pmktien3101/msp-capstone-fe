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

  /**
   * @param callId UUID of the call
   * @param hard whether to hard delete (default true)
   */
  async deleteCall(
    callId: string,
    hard: boolean = true
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!callId) throw new Error("callId is required");
      const url = `${this.baseUrl}/stream/call/default/${callId}/delete?hard=${hard}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "*/*" },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to delete call: ${response.status} ${text}`);
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch {}
      return { success: true, message: data?.message };
    } catch (error) {
      console.error("Error deleting call:", error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();
