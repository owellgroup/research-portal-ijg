import type { User } from "@/types/user";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Trim the inputs
  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  const endpoint = API_ENDPOINTS.login;
  console.log("API: Attempting login with:", { 
    email: normalizedEmail, 
    passwordLength: normalizedPassword.length,
    endpoint 
  });

  // Create form data
  const formData = new URLSearchParams();
  formData.append('email', normalizedEmail);
  formData.append('password', normalizedPassword);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "https://ijg-research-admin.vercel.app"
      },
      body: formData
    });

    console.log("API: Response status:", response.status);
    const responseText = await response.text();
    console.log("API: Response text:", responseText);

    if (response.ok) {
      // The backend returns a simple string message
      const isSuccess = responseText === "Login successful!";
      return {
        success: isSuccess,
        message: responseText
      };
    } else {
      let errorMessage = "Login failed";
      try {
        const errorData = JSON.parse(responseText) as ErrorResponse;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error("API: Error parsing error response:", e);
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error) {
    console.error("API: Network error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error occurred"
    };
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://ijg-research-admin.vercel.app',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      credentials: 'include'
    });
    

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    //
    console.log('Fetched users:', data);
    
    // Transform the data to match your User type if needed
    return data.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password: '' // Don't include password in the frontend
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}