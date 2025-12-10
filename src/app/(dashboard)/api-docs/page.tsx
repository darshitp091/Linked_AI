'use client'

import { useState } from 'react'
import { Code, Copy, Check, Book, Key, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function APIDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const router = useRouter()

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="p-2 hover:bg-gray-700 rounded transition-colors"
    >
      {copiedEndpoint === id ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  )

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
          {language}
        </span>
        <CopyButton text={code} id={id} />
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Book className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600">
                RESTful API for programmatic access to your LinkedIn content
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => router.push('/settings/api')}>
              <Key className="w-4 h-4 mr-2" />
              Manage API Keys
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Get Your API Key</h3>
              <p className="text-gray-600 mb-2">
                Navigate to Settings → API Keys and create a new API key with the required scopes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Authenticate Your Requests</h3>
              <p className="text-gray-600 mb-3">
                Include your API key in the Authorization header:
              </p>
              <CodeBlock
                code="Authorization: Bearer ll_your_api_key_here"
                language="HTTP"
                id="auth-header"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Make Your First Request</h3>
              <CodeBlock
                code={`curl -X GET 'https://yourdomain.com/api/v1/posts' \\
  -H 'Authorization: Bearer ll_your_api_key_here'`}
                language="bash"
                id="first-request"
              />
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">https://yourdomain.com/api/v1</code>
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>Rate Limits:</strong> Standard: 1,000 requests/hour | Custom: 5,000 requests/hour
          </p>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Authentication
          </h2>

          <p className="text-gray-600 mb-4">
            All API requests must include a valid API key in the Authorization header using the Bearer scheme.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">API Key Format</h3>
              <CodeBlock
                code="ll_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                language="text"
                id="key-format"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Example Request</h3>
              <CodeBlock
                code={`fetch('https://yourdomain.com/api/v1/posts', {
  headers: {
    'Authorization': 'Bearer ll_your_api_key_here',
    'Content-Type': 'application/json'
  }
})`}
                language="javascript"
                id="auth-example"
              />
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">API Endpoints</h2>

          {/* GET Posts */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded">
                GET
              </span>
              <code className="text-gray-900 font-mono">/posts</code>
            </div>
            <p className="text-gray-600 mb-4">Retrieve your posts</p>

            <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
            <div className="bg-gray-50 rounded p-4 mb-4 space-y-2">
              <p className="text-sm"><code>status</code> (optional): Filter by status (draft, scheduled, published)</p>
              <p className="text-sm"><code>limit</code> (optional): Number of results (default: 50, max: 100)</p>
              <p className="text-sm"><code>offset</code> (optional): Pagination offset (default: 0)</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Required Scope</h4>
            <p className="text-sm text-gray-600 mb-4"><code>posts:read</code></p>

            <h4 className="font-semibold text-gray-900 mb-2">Example</h4>
            <CodeBlock
              code={`curl -X GET 'https://yourdomain.com/api/v1/posts?status=published&limit=10' \\
  -H 'Authorization: Bearer ll_your_api_key_here'`}
              language="bash"
              id="get-posts"
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response</h4>
            <CodeBlock
              code={`{
  "posts": [
    {
      "id": "uuid",
      "content": "My awesome LinkedIn post",
      "status": "published",
      "published_at": "2025-01-15T10:00:00Z",
      "created_at": "2025-01-14T15:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 1
  }
}`}
              language="json"
              id="get-posts-response"
            />
          </div>

          {/* POST Posts */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-sm rounded">
                POST
              </span>
              <code className="text-gray-900 font-mono">/posts</code>
            </div>
            <p className="text-gray-600 mb-4">Create a new post</p>

            <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
            <div className="bg-gray-50 rounded p-4 mb-4 space-y-2">
              <p className="text-sm"><code>content</code> (required): Post content (string)</p>
              <p className="text-sm"><code>status</code> (optional): draft | scheduled | published (default: draft)</p>
              <p className="text-sm"><code>scheduled_for</code> (optional): ISO 8601 datetime for scheduling</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Required Scope</h4>
            <p className="text-sm text-gray-600 mb-4"><code>posts:write</code></p>

            <h4 className="font-semibold text-gray-900 mb-2">Example</h4>
            <CodeBlock
              code={`curl -X POST 'https://yourdomain.com/api/v1/posts' \\
  -H 'Authorization: Bearer ll_your_api_key_here' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": "Excited to share my latest project!",
    "status": "scheduled",
    "scheduled_for": "2025-01-20T10:00:00Z"
  }'`}
              language="bash"
              id="post-posts"
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response</h4>
            <CodeBlock
              code={`{
  "post": {
    "id": "uuid",
    "content": "Excited to share my latest project!",
    "status": "scheduled",
    "scheduled_for": "2025-01-20T10:00:00Z",
    "created_at": "2025-01-15T10:00:00Z"
  }
}`}
              language="json"
              id="post-posts-response"
            />
          </div>
        </div>

        {/* Error Codes */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error Codes</h2>

          <div className="space-y-3">
            <div className="flex gap-4">
              <code className="font-semibold text-red-600 min-w-[60px]">401</code>
              <span className="text-gray-600">Unauthorized - Invalid or missing API key</span>
            </div>
            <div className="flex gap-4">
              <code className="font-semibold text-red-600 min-w-[60px]">403</code>
              <span className="text-gray-600">Forbidden - Insufficient permissions for the requested scope</span>
            </div>
            <div className="flex gap-4">
              <code className="font-semibold text-red-600 min-w-[60px]">404</code>
              <span className="text-gray-600">Not Found - Resource not found</span>
            </div>
            <div className="flex gap-4">
              <code className="font-semibold text-red-600 min-w-[60px]">429</code>
              <span className="text-gray-600">Too Many Requests - Rate limit exceeded</span>
            </div>
            <div className="flex gap-4">
              <code className="font-semibold text-red-600 min-w-[60px]">500</code>
              <span className="text-gray-600">Internal Server Error - Something went wrong on our end</span>
            </div>
          </div>
        </div>

        {/* Available Scopes */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Scopes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">posts:read</code>
              <p className="text-sm text-gray-600 mt-1">Read posts and their metadata</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">posts:write</code>
              <p className="text-sm text-gray-600 mt-1">Create and update posts</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">posts:delete</code>
              <p className="text-sm text-gray-600 mt-1">Delete posts</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">analytics:read</code>
              <p className="text-sm text-gray-600 mt-1">Read analytics data</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">schedule:write</code>
              <p className="text-sm text-gray-600 mt-1">Schedule posts</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <code className="font-semibold text-purple-600">drafts:read</code>
              <p className="text-sm text-gray-600 mt-1">Read draft posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
