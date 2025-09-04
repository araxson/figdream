'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface TemplateEditorProps {
  className?: string
}

export function TemplateEditor({ className }: TemplateEditorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Template Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
