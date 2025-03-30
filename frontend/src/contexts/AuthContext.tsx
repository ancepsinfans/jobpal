import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"
import { apiClient } from "../api/client"

interface User {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

export const AuthProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await apiClient.get("/api/v1/auth/me")
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const formData = new FormData()
    formData.append("username", email)
    formData.append("password", password)

    const response = await apiClient.post(
      "/api/v1/auth/login",
      formData
    )
    const { access_token } = response.data
    localStorage.setItem("token", access_token)
    await fetchUser()
  }

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const response = await apiClient.post("/api/v1/auth/register", {
      email,
      password,
      full_name: fullName,
    })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
