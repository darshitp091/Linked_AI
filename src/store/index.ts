import { create } from 'zustand'
import { User, Post } from '@/types'

interface AppState {
  user: User | null
  posts: Post[]
  isLoading: boolean
  setUser: (user: User | null) => void
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  posts: [],
  isLoading: false,
  setUser: (user) => set({ user }),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  updatePost: (id, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePost: (id) =>
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}))
