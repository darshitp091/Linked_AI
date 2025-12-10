# API Reference Guide

## Overview

The API allows programmatic access to all LinkedAI features. Available only on **Enterprise Plan**.

**Base URL**: `https://your-app.vercel.app/api`

---

## Authentication

### Get API Key

1. Go to **API Docs** page (Enterprise only)
2. Click **Generate API Key**
3. Set permissions (read/write/delete)
4. Copy key (shown once!)

### Use API Key

```bash
curl https://your-app.vercel.app/api/posts \
  -H "Authorization: Bearer your_api_key_here"
```

All API requests require `Authorization` header.

---

## Endpoints

### Posts

#### List Posts
```
GET /api/posts
```

Query parameters:
- `status` - filter by status (draft/scheduled/published)
- `limit` - number of posts (default: 20)
- `offset` - pagination offset

Response:
```json
{
  "success": true,
  "posts": [
    {
      "id": "uuid",
      "content": "Post content",
      "status": "published",
      "scheduled_for": "2025-12-01T10:00:00Z",
      "published_at": "2025-12-01T10:00:05Z",
      "created_at": "2025-11-28T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Post
```
POST /api/posts
```

Body:
```json
{
  "content": "My LinkedIn post content",
  "scheduled_for": "2025-12-01T10:00:00Z",
  "linkedin_account_id": "account_id",
  "status": "scheduled"
}
```

Response:
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "content": "My LinkedIn post content",
    "status": "scheduled",
    "scheduled_for": "2025-12-01T10:00:00Z"
  }
}
```

#### Update Post
```
PATCH /api/posts/[id]
```

Body:
```json
{
  "content": "Updated content",
  "scheduled_for": "2025-12-02T15:00:00Z"
}
```

#### Delete Post
```
DELETE /api/posts/[id]
```

---

### Drafts

#### List Drafts
```
GET /api/drafts
```

#### Create Draft
```
POST /api/drafts
```

Body:
```json
{
  "title": "Draft title",
  "content": "Draft content"
}
```

#### Convert Draft to Post
```
POST /api/drafts/[id]/convert
```

Body:
```json
{
  "scheduled_for": "2025-12-01T10:00:00Z",
  "linkedin_account_id": "account_id"
}
```

---

### Analytics

#### Get Overview
```
GET /api/analytics/overview
```

Response:
```json
{
  "success": true,
  "totalPosts": 50,
  "totalViews": 12500,
  "totalLikes": 850,
  "totalComments": 125,
  "totalShares": 45,
  "avgEngagementRate": 8.2,
  "topPost": {
    "id": "uuid",
    "content": "Best performing post",
    "views": 2500,
    "engagementRate": 15.4
  }
}
```

#### Get Trend Data
```
GET /api/analytics/trend?days=30
```

Query parameters:
- `days` - 7, 14, 30, or 90

Response:
```json
{
  "success": true,
  "trend": [
    {
      "date": "2025-11-01",
      "views": 450,
      "likes": 35,
      "comments": 8,
      "shares": 3
    }
  ]
}
```

#### Get Post Performance
```
GET /api/analytics/posts?limit=10&sortBy=views&order=desc
```

---

### Templates

#### List Templates
```
GET /api/templates
```

#### Create Template
```
POST /api/templates
```

Body:
```json
{
  "name": "Template name",
  "category": "tips",
  "content": "Template content with {{variable}}"
}
```

---

### A/B Tests (Pro Plan)

#### List Tests
```
GET /api/ab-tests
```

#### Create Test
```
POST /api/ab-tests
```

Body:
```json
{
  "name": "Test name",
  "description": "Test description",
  "start_date": "2025-12-01",
  "end_date": "2025-12-07",
  "variants": [
    {
      "name": "Variant A",
      "content": "First version"
    },
    {
      "name": "Variant B",
      "content": "Second version"
    }
  ]
}
```

#### Get Test Results
```
GET /api/ab-tests/[id]
```

---

### Workspaces (Enterprise Plan)

#### List Workspaces
```
GET /api/workspaces
```

#### Create Workspace
```
POST /api/workspaces
```

Body:
```json
{
  "name": "Marketing Team",
  "description": "Our marketing workspace"
}
```

#### Invite Member
```
POST /api/workspaces/invitations
```

Body:
```json
{
  "workspaceId": "workspace_id",
  "email": "user@example.com",
  "role": "editor"
}
```

---

## Code Examples

### Node.js

```javascript
const fetch = require('node-fetch')

const API_KEY = 'your_api_key'
const BASE_URL = 'https://your-app.vercel.app/api'

async function createPost() {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'My automated LinkedIn post',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    })
  })

  const data = await response.json()
  console.log('Post created:', data)
}

createPost()
```

### Python

```python
import requests
from datetime import datetime, timedelta

API_KEY = 'your_api_key'
BASE_URL = 'https://your-app.vercel.app/api'

def create_post():
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    data = {
        'content': 'My automated LinkedIn post',
        'scheduled_for': (datetime.now() + timedelta(days=1)).isoformat(),
        'status': 'scheduled'
    }

    response = requests.post(
        f'{BASE_URL}/posts',
        headers=headers,
        json=data
    )

    print('Post created:', response.json())

create_post()
```

### cURL

```bash
# Create post
curl -X POST https://your-app.vercel.app/api/posts \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My automated LinkedIn post",
    "scheduled_for": "2025-12-01T10:00:00Z",
    "status": "scheduled"
  }'

# Get analytics
curl -X GET https://your-app.vercel.app/api/analytics/overview \
  -H "Authorization: Bearer your_api_key"
```

---

## Rate Limits

**Enterprise Plan**:
- 1000 requests/hour
- 10,000 requests/day

Exceeded limits return:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

---

## Webhooks (Coming Soon)

Subscribe to events:
- `post.published` - When post goes live
- `post.failed` - When post fails to publish
- `analytics.updated` - When analytics sync completes

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Best Practices

1. **Cache responses** - Don't fetch same data repeatedly
2. **Use pagination** - Don't fetch all posts at once
3. **Handle errors** - Always check response status
4. **Rate limiting** - Implement exponential backoff
5. **Secure keys** - Never expose API keys in client code
