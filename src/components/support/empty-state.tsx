import { Button } from '@/components/ui/button'
import { MessageSquare, Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateTicket: () => void
}

export function EmptyState({ onCreateTicket }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-[#0a66c2]" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No support tickets yet</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Need help? Create a support ticket and our team will get back to you based on your plan level.
      </p>
      <Button onClick={onCreateTicket} className="gap-2">
        <Plus className="w-4 h-4" />
        Create Your First Ticket
      </Button>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Create Tickets</h4>
          <p className="text-sm text-gray-500">Submit issues, questions, or feature requests</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Get Responses</h4>
          <p className="text-sm text-gray-500">Our team responds based on your plan SLA</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Track Progress</h4>
          <p className="text-sm text-gray-500">Monitor ticket status and conversations</p>
        </div>
      </div>
    </div>
  )
}
