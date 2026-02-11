/**
 * Common Utility Types
 */

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type ID = string

export type Timestamp = Date | string

export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface SelectOption<T = string> {
  label: string
  value: T
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
