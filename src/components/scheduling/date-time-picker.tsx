'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  className?: string
}

export function DateTimePicker({
  selected,
  onChange,
  minDate = new Date(),
  className = '',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-2" />
          Select Date
        </label>
        <DatePicker
          selected={selected}
          onChange={onChange}
          minDate={minDate}
          dateFormat="MMMM d, yyyy"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Choose a date"
          open={isOpen}
          onInputClick={() => setIsOpen(true)}
          onClickOutside={() => setIsOpen(false)}
        />
      </div>

      {/* Time Selection */}
      {selected && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-2" />
            Select Time
          </label>
          <DatePicker
            selected={selected}
            onChange={onChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Choose a time"
          />
        </div>
      )}

      {/* Selected DateTime Display */}
      {selected && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Scheduled for:
          </p>
          <p className="text-lg font-bold text-blue-700 mt-1">
            {format(selected, 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-md text-blue-600">
            {format(selected, 'h:mm a')}
          </p>
        </div>
      )}
    </div>
  )
}
