'use client'

import { useState } from 'react'
import { postTemplates, getTemplatesByCategory, getAllCategories, PostTemplate } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import { Search, Filter, Copy, Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = getAllCategories()

  const filteredTemplates = postTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (template: PostTemplate) => {
    // Store template in localStorage and redirect to generate page
    localStorage.setItem('selectedTemplate', JSON.stringify(template))
    router.push('/generate?template=true')
  }

  const handleCopyTemplate = (template: PostTemplate) => {
    navigator.clipboard.writeText(template.template)
    setCopiedId(template.id)
    toast.success('Template copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categoryColors: Record<string, string> = {
    'thought-leadership': 'bg-purple-100 text-purple-700',
    'announcement': 'bg-blue-100 text-blue-700',
    'educational': 'bg-green-100 text-green-700',
    'engagement': 'bg-orange-100 text-orange-700',
    'storytelling': 'bg-pink-100 text-pink-700',
    'tips': 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Templates</h1>
              <p className="text-gray-600">Start with proven templates and customize</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[template.category]}`}>
                    {template.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>

              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                  {template.template.slice(0, 150)}
                  {template.template.length > 150 && '...'}
                </pre>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {template.tone}
                </span>
                {template.variables && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {template.variables.length} variables
                  </span>
                )}
              </div>

              {/* Hashtags */}
              {template.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.hashtags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-[#0a66c2]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1"
                  size="sm"
                >
                  Use Template
                </Button>
                <Button
                  onClick={() => handleCopyTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="w-10"
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
