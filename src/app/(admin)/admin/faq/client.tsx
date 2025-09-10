'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusIcon, Edit2Icon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { FAQForm } from '@/components/features/faq/faq-form'

type FAQCategory = Database['public']['Tables']['faq_categories']['Row']
type FAQQuestion = Database['public']['Tables']['faq_questions']['Row']

interface FAQWithCategory extends FAQQuestion {
  category?: FAQCategory | null
}

export function FAQManagementClient() {
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [questions, setQuestions] = useState<FAQWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<FAQQuestion | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFAQData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadFAQData() {
    try {
      const [categoriesResult, questionsResult] = await Promise.all([
        supabase
          .from('faq_categories')
          .select('*')
          .order('display_order'),
        supabase
          .from('faq_questions')
          .select('*, category:faq_categories(*)')
          .order('display_order')
      ])

      if (categoriesResult.error) throw categoriesResult.error
      if (questionsResult.error) throw questionsResult.error

      setCategories(categoriesResult.data || [])
      setQuestions(questionsResult.data || [])
    } catch (error) {
      console.error('Error loading FAQ data:', error)
      toast.error('Failed to load FAQ data')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteQuestion(id: string) {
    try {
      const { error } = await supabase
        .from('faq_questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      setQuestions(prev => prev.filter(q => q.id !== id))
      toast.success('Question deleted successfully')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const groupedQuestions = categories.map(category => ({
    category,
    questions: questions.filter(q => q.category_id === category.id)
  }))

  const uncategorizedQuestions = questions.filter(q => !q.category_id)

  if (isLoading) {
    return <div>Loading FAQ data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">FAQ Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingQuestion(null)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            <FAQForm
              categories={categories}
              question={editingQuestion}
              onSuccess={() => {
                setIsDialogOpen(false)
                loadFAQData()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {groupedQuestions.map(({ category, questions }) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions in this category</p>
              ) : (
                <Accordion type="single" collapsible>
                  {questions.map(question => (
                    <AccordionItem key={question.id} value={question.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{question.question}</span>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingQuestion(question)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteQuestion(question.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm">{question.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}

        {uncategorizedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uncategorized Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {uncategorizedQuestions.map(question => (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{question.question}</span>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingQuestion(question)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit2Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">{question.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}