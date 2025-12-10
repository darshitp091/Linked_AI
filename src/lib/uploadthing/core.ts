import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { createClient } from '@/lib/supabase/server'

const f = createUploadthing()

export const ourFileRouter = {
  // Image uploader for LinkedIn posts
  postImage: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Video uploader for LinkedIn posts
  postVideo: f({ video: { maxFileSize: '16MB', maxFileCount: 1 } })
    .middleware(async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Document uploader (PDF, etc)
  postDocument: f({ pdf: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
