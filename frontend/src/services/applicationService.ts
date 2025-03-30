import { apiClient } from "../api/client"

export interface Application {
  id: number
  company_name: string
  position_title: string
  job_description?: string
  application_url?: string
  status:
    | "draft"
    | "applied"
    | "interviewing"
    | "offered"
    | "rejected"
    | "withdrawn"
  notes?: string
  created_at: string
  updated_at?: string
  applied_date?: string
  next_interview_date?: string
  salary_range?: string
  location?: string
  remote_hybrid_onsite?: string
}

export interface ApplicationCreate {
  company_name: string
  position_title: string
  job_description?: string
  application_url?: string
  status?: Application["status"]
  notes?: string
  applied_date?: string
  next_interview_date?: string
  salary_range?: string
  location?: string
  remote_hybrid_onsite?: string
}

export interface ApplicationUpdate
  extends Partial<ApplicationCreate> {}

export const applicationService = {
  /**
   * Get all applications with pagination
   */
  getApplications: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<Application[]> => {
    const response = await apiClient.get(
      `/api/v1/applications?skip=${skip}&limit=${limit}`
    )
    return response.data
  },

  /**
   * Get a single application by ID
   */
  getApplication: async (id: number): Promise<Application> => {
    const response = await apiClient.get(`/api/v1/applications/${id}`)
    return response.data
  },

  /**
   * Create a new application
   */
  createApplication: async (
    data: ApplicationCreate
  ): Promise<Application> => {
    const response = await apiClient.post(
      "/api/v1/applications",
      data
    )
    return response.data
  },

  /**
   * Update an existing application
   */
  updateApplication: async (
    id: number,
    data: ApplicationUpdate
  ): Promise<Application> => {
    const response = await apiClient.put(
      `/api/v1/applications/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an application
   */
  deleteApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/applications/${id}`)
  },
}
