'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { RichTextEditorProps } from './campaign-form.types'

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  maxLength
}: RichTextEditorProps) {
  const [characterCount, setCharacterCount] = React.useState(value?.length || 0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return
    }
    setCharacterCount(newValue.length)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-40"
      />
      {maxLength && (
        <div className="flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            Rich text editor placeholder (HTML supported)
          </div>
          <div className={cn(
            "text-muted-foreground",
            characterCount > maxLength * 0.9 && "text-yellow-600",
            characterCount === maxLength && "text-red-600"
          )}>
            {characterCount} / {maxLength}
          </div>
        </div>
      )}
    </div>
  )
}