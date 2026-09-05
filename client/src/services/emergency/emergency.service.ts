const API_URL = "http://localhost:5000/api";

export interface Emergency {
  id: string;
  userId: string;
  type: string;
  description?: string | null;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;

  incidentAssignments?: IncidentAssignment[];
}

export interface IncidentAssignment {
  id: string;
  emergencyId: string;
  responderId: string;
  status: string;
  assignedAt: string;
  acceptedAt?: string | null;
  responder?: {
    id: string;
    user?: {
      id: string;
      name: string;
      phone?: string | null;
      email?: string;
    };
  };
}

export interface CreateEmergencyData {
  type: string;
  description?: string;
  priority?: string;
  latitude: number;
  longitude: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =====================================================
// CREATE EMERGENCY
// =====================================================

export const createEmergency = async (
  emergencyData: CreateEmergencyData
) => {
  const response = await fetch(
    `${API_URL}/emergencies`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(emergencyData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create emergency"
    );
  }

  return data;
};

// =====================================================
// GET MY EMERGENCIES
// =====================================================

export const getMyEmergencies = async (): Promise<
  Emergency[]
> => {
  const response = await fetch(
    `${API_URL}/emergencies/my`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch emergencies"
    );
  }

  return data.data || [];
};

// =====================================================
// GET EMERGENCY BY ID
// =====================================================

export const getEmergencyById = async (
  emergencyId: string
): Promise<Emergency> => {
  const response = await fetch(
    `${API_URL}/emergencies/${emergencyId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch emergency"
    );
  }

  return data.data;
};

// =====================================================
// CANCEL EMERGENCY
// =====================================================

export const cancelEmergency = async (
  emergencyId: string
) => {
  const response = await fetch(
    `${API_URL}/emergencies/${emergencyId}/cancel`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to cancel emergency"
    );
  }

  return data;
};