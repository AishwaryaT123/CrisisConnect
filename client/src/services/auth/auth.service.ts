const API_URL = "http://localhost:5000/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ======================================================
// LOGIN
// ======================================================

export const loginUser = async (
  loginData: LoginData
): Promise<AuthResponse> => {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }
  );

  const data: AuthResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Login failed"
    );
  }

  // Save authentication information
  if (data.success && data.data) {
    localStorage.setItem(
      "token",
      data.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.data.user)
    );
  }

  return data;
};

// ======================================================
// REGISTER CITIZEN
// ======================================================

export const registerUser = async (
  registerData: RegisterData
): Promise<AuthResponse> => {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    }
  );

  const data: AuthResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }

  // Save authentication information
  if (data.success && data.data) {
    localStorage.setItem(
      "token",
      data.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.data.user)
    );
  }

  return data;
};

// ======================================================
// GET TOKEN
// ======================================================

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// ======================================================
// GET CURRENT USER
// ======================================================

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch (error) {
    console.error(
      "Failed to parse user data:",
      error
    );

    return null;
  }
};

// ======================================================
// CHECK AUTHENTICATION
// ======================================================

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// ======================================================
// LOGOUT
// ======================================================

export const logoutUser = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ======================================================
// GET AUTHENTICATED USER FROM BACKEND
// ======================================================

export const getMe = async () => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found"
    );
  }

  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to get authenticated user"
    );
  }

  return data;
};