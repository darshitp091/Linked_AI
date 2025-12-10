/**
 * LinkedIn API Client
 * Handles posting content to LinkedIn
 */

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
}

interface LinkedInPostResponse {
  id: string
  created: {
    time: number
  }
}

/**
 * Post content to LinkedIn
 */
export async function postToLinkedIn(
  accessToken: string,
  userId: string,
  content: string
): Promise<LinkedInPostResponse> {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('LinkedIn API Error:', errorText)
    throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Post content with image to LinkedIn
 */
export async function postToLinkedInWithImage(
  accessToken: string,
  userId: string,
  content: string,
  imageUrl: string
): Promise<LinkedInPostResponse> {
  // First, register the image upload
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${userId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  )

  if (!registerResponse.ok) {
    throw new Error(`Failed to register image upload: ${registerResponse.status}`)
  }

  const registerData = await registerResponse.json()
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl
  const asset = registerData.value.asset

  // Download image and upload to LinkedIn
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: imageBuffer,
  })

  // Create post with image
  const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: {
                text: 'Post image',
              },
              media: asset,
              title: {
                text: 'Image',
              },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!postResponse.ok) {
    const errorText = await postResponse.text()
    throw new Error(`Failed to create post with image: ${errorText}`)
  }

  return await postResponse.json()
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfile> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`)
  }

  const data = await response.json()
  return {
    id: data.sub,
    firstName: data.given_name,
    lastName: data.family_name,
    profilePicture: data.picture,
  }
}
