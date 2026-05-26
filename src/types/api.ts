export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
