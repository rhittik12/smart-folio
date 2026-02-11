/**
 * Builder Types
 */

export enum BlockType {
  HERO = 'HERO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  GALLERY = 'GALLERY',
  VIDEO = 'VIDEO',
  SKILLS = 'SKILLS',
  TIMELINE = 'TIMELINE',
  PROJECTS = 'PROJECTS',
  TESTIMONIALS = 'TESTIMONIALS',
  CONTACT = 'CONTACT',
  CTA = 'CTA',
  SPACER = 'SPACER',
}

export interface Block {
  id: string
  type: BlockType
  content: Record<string, any>
  styles: BlockStyles
  order: number
  visible: boolean
}

export interface BlockStyles {
  backgroundColor?: string
  textColor?: string
  padding?: string
  margin?: string
  alignment?: 'left' | 'center' | 'right'
  fontSize?: string
  fontWeight?: string
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  blocks: Omit<Block, 'id'>[]
  theme: string
  isPremium: boolean
  createdAt: Date
}

export interface BuilderState {
  portfolioId: string
  blocks: Block[]
  selectedBlockId: string | null
  theme: string
  isPreviewMode: boolean
  history: BuilderHistory[]
  historyIndex: number
}

export interface BuilderHistory {
  blocks: Block[]
  timestamp: Date
  action: string
}

export interface DragItem {
  id: string
  type: BlockType
  index: number
}

export interface DropResult {
  index: number
}
