import type { AxiosError } from 'axios'

export type HttpErrorDetail = string | Record<string, string[]>

export type HttpError = {
  message: string
  status?: number
  detail?: HttpErrorDetail
}

export function parseAxiosError(err: unknown): HttpError {
  const fallback: HttpError = { message: 'Network error' }

  if (!err) return fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any
  if (anyErr.isAxiosError) {
    const axiosErr = anyErr as AxiosError
    const status = axiosErr.response?.status
    const data = axiosErr.response?.data
    let detail: HttpErrorDetail | undefined = undefined
    if (data) {
      if (typeof data === 'string') detail = data
      else if ((data as any).detail) detail = (data as any).detail as HttpErrorDetail
      else detail = data as HttpErrorDetail
    }
    return {
      message: axiosErr.message || 'Request failed',
      status: status,
      detail,
    }
  }

  return { message: (anyErr && anyErr.message) || 'Unknown error' }
}
