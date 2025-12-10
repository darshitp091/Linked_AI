'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ABTestVariant, suggestTrafficSplit, validateABTestConfig } from '@/lib/ab-testing'

interface ABTestWizardProps {
  onComplete: (testConfig: any) => void
  onCancel: () => void
  maxVariants?: number
}

export default function ABTestWizard({
  onComplete,
  onCancel,
  maxVariants = 5,
}: ABTestWizardProps) {
  const [step, setStep] = useState(1)
  const [testConfig, setTestConfig] = useState({
    name: '',
    description: '',
    test_type: 'content' as 'content' | 'hashtags' | 'cta' | 'mixed',
    duration_hours: 72,
    min_sample_size: 100,
    auto_promote_winner: false,
  })

  const [variants, setVariants] = useState<ABTestVariant[]>([
    {
      variant_name: 'A',
      variant_label: 'Variant A',
      traffic_percentage: 50,
      content: '',
      hashtags: [],
    },
    {
      variant_name: 'B',
      variant_label: 'Variant B',
      traffic_percentage: 50,
      content: '',
      hashtags: [],
    },
  ])

  const [errors, setErrors] = useState<string[]>([])

  const addVariant = () => {
    if (variants.length >= maxVariants) return

    const variantName = String.fromCharCode(65 + variants.length) // A, B, C, D, E
    const newSplit = suggestTrafficSplit(variants.length + 1)

    const newVariants = [...variants, {
      variant_name: variantName,
      variant_label: `Variant ${variantName}`,
      traffic_percentage: newSplit[newSplit.length - 1],
      content: '',
      hashtags: [],
    }]

    // Update traffic percentages for all variants
    newVariants.forEach((v, i) => {
      v.traffic_percentage = newSplit[i]
    })

    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return

    const newVariants = variants.filter((_, i) => i !== index)
    const newSplit = suggestTrafficSplit(newVariants.length)

    newVariants.forEach((v, i) => {
      v.traffic_percentage = newSplit[i]
    })

    setVariants(newVariants)
  }

  const updateVariant = (index: number, field: keyof ABTestVariant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!testConfig.name.trim()) {
        setErrors(['Test name is required'])
        return
      }
      setErrors([])
      setStep(2)
    } else if (step === 2) {
      const validation = validateABTestConfig({
        ...testConfig,
        variants,
      })

      if (!validation.valid) {
        setErrors(validation.errors)
        return
      }

      setErrors([])
      setStep(3)
    } else if (step === 3) {
      onComplete({
        ...testConfig,
        variants,
      })
    }
  }

  const handleBack = () => {
    setErrors([])
    setStep(step - 1)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-blue-600' : 'bg-gray-200'
                } ${s === 3 ? 'hidden' : ''}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium">Test Details</span>
          <span className="text-sm font-medium">Variants</span>
          <span className="text-sm font-medium">Review</span>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Test Details */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name *
            </label>
            <input
              type="text"
              value={testConfig.name}
              onChange={(e) => setTestConfig({ ...testConfig, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Headline A/B Test - Product Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={testConfig.description}
              onChange={(e) => setTestConfig({ ...testConfig, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="What are you testing and why?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type
            </label>
            <select
              value={testConfig.test_type}
              onChange={(e) => setTestConfig({ ...testConfig, test_type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="content">Content Variations</option>
              <option value="hashtags">Hashtag Variations</option>
              <option value="cta">CTA Variations</option>
              <option value="mixed">Mixed (Content + Hashtags + CTA)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Duration (hours)
              </label>
              <input
                type="number"
                value={testConfig.duration_hours}
                onChange={(e) => setTestConfig({ ...testConfig, duration_hours: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="720"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 72 hours (3 days)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Sample Size (views)
              </label>
              <input
                type="number"
                value={testConfig.min_sample_size}
                onChange={(e) => setTestConfig({ ...testConfig, min_sample_size: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="50"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum views needed per variant
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto_promote"
              checked={testConfig.auto_promote_winner}
              onChange={(e) => setTestConfig({ ...testConfig, auto_promote_winner: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_promote" className="ml-2 text-sm text-gray-700">
              Automatically promote winner after test completes
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Variants */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create Variants ({variants.length}/{maxVariants})</h3>
            {variants.length < maxVariants && (
              <Button onClick={addVariant} variant="outline">
                + Add Variant
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {variant.variant_name}
                    </div>
                    <input
                      type="text"
                      value={variant.variant_label}
                      onChange={(e) => updateVariant(index, 'variant_label', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Label"
                    />
                    <div className="text-sm text-gray-500">
                      Traffic: {variant.traffic_percentage}%
                    </div>
                  </div>
                  {variants.length > 2 && (
                    <button
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={variant.content}
                      onChange={(e) => updateVariant(index, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Write your post content here..."
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{variant.content.length} characters</span>
                      <span>{variant.content.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      value={(variant.hashtags || []).join(', ')}
                      onChange={(e) => {
                        const hashtags = e.target.value
                          .split(',')
                          .map(h => h.trim())
                          .filter(Boolean)
                        updateVariant(index, 'hashtags', hashtags)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="hashtag1, hashtag2, hashtag3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Test Summary</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Test Name</dt>
                <dd className="text-sm text-gray-900 mt-1">{testConfig.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Test Type</dt>
                <dd className="text-sm text-gray-900 mt-1 capitalize">{testConfig.test_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900 mt-1">{testConfig.duration_hours} hours</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Variants</dt>
                <dd className="text-sm text-gray-900 mt-1">{variants.length} variants</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Min Sample Size</dt>
                <dd className="text-sm text-gray-900 mt-1">{testConfig.min_sample_size} views per variant</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Auto-Promote</dt>
                <dd className="text-sm text-gray-900 mt-1">{testConfig.auto_promote_winner ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Variant Previews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {variant.variant_name}
                      </div>
                      <span className="font-medium text-sm">{variant.variant_label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{variant.traffic_percentage}% traffic</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                    {variant.content}
                  </div>
                  {variant.hashtags && variant.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {variant.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-blue-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <div>
          {step > 1 && (
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleNext}>
            {step === 3 ? 'Create Test' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
