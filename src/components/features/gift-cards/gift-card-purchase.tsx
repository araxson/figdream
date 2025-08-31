'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Gift,
  CreditCard,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  User,
  Heart,
  Sparkles,
  Star,
  Check,
  AlertCircle,
  Loader2,
  Info,
  Camera,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { purchaseGiftCardSchema, type PurchaseGiftCardInput } from '@/lib/validations/advanced-features-schema'
import { purchaseGiftCard } from '@/lib/data-access/loyalty/gift-cards'

interface GiftCardPurchaseProps {
  salonId: string
  salonName?: string
  className?: string
  onSuccess?: (giftCard: any) => void
  onCancel?: () => void
}

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 200]

const GIFT_CARD_DESIGNS = [
  { id: 'classic', name: 'Classic', preview: '/images/gift-cards/classic.svg' },
  { id: 'elegant', name: 'Elegant', preview: '/images/gift-cards/elegant.svg' },
  { id: 'modern', name: 'Modern', preview: '/images/gift-cards/modern.svg' },
  { id: 'festive', name: 'Festive', preview: '/images/gift-cards/festive.svg' },
  { id: 'birthday', name: 'Birthday', preview: '/images/gift-cards/birthday.svg' },
  { id: 'spa', name: 'Spa & Wellness', preview: '/images/gift-cards/spa.svg' },
]

export function GiftCardPurchase({ 
  salonId, 
  salonName = 'Salon',
  className, 
  onSuccess, 
  onCancel 
}: GiftCardPurchaseProps) {
  const [step, setStep] = React.useState<'details' | 'design' | 'payment' | 'confirmation'>('details')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [customAmount, setCustomAmount] = React.useState('')
  const [selectedDesign, setSelectedDesign] = React.useState(GIFT_CARD_DESIGNS[0].id)
  const [customImage, setCustomImage] = React.useState<File | null>(null)
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)

  const form = useForm<PurchaseGiftCardInput>({
    resolver: zodResolver(purchaseGiftCardSchema),
    defaultValues: {
      salon_id: salonId,
      type: 'digital',
      amount: 50,
      currency: 'USD',
      purchaser_name: '',
      purchaser_email: '',
      purchaser_phone: '',
      recipient_name: '',
      recipient_email: '',
      recipient_phone: '',
      message: '',
      delivery_date: undefined,
      expires_at: undefined,
      design_template: GIFT_CARD_DESIGNS[0].id,
      custom_image_url: '',
      payment_method_id: '',
      billing_address: {
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      },
    },
  })

  const watchedAmount = form.watch('amount')
  const watchedType = form.watch('type')

  const handleAmountSelect = (amount: number) => {
    form.setValue('amount', amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setCustomAmount(value)
    if (numValue >= 5 && numValue <= 5000) {
      form.setValue('amount', numValue)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      setCustomImage(file)
      setSelectedDesign('custom')
      form.setValue('design_template', 'custom')
      
      // In a real app, you'd upload to cloud storage and get URL
      const mockUrl = `https://example.com/custom-images/${file.name}`
      form.setValue('custom_image_url', mockUrl)
    }
  }

  const onSubmit = async (data: PurchaseGiftCardInput) => {
    try {
      setIsProcessing(true)
      setError(null)

      // Set selected design
      data.design_template = selectedDesign
      
      // Set delivery date if selected
      if (deliveryDate) {
        data.delivery_date = deliveryDate.toISOString()
      }

      // Set expiration date (1 year from now)
      const expirationDate = new Date()
      expirationDate.setFullYear(expirationDate.getFullYear() + 1)
      data.expires_at = expirationDate.toISOString()

      const result = await purchaseGiftCard(data)

      if (!result.success) {
        throw new Error(result.error || 'Failed to purchase gift card')
      }

      setStep('confirmation')
      onSuccess?.(result.data)
    } catch (err) {
      console.error('Gift card purchase error:', err)
      setError(err instanceof Error ? err.message : 'Failed to purchase gift card')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: 'details', label: 'Details', icon: User },
      { key: 'design', label: 'Design', icon: Camera },
      { key: 'payment', label: 'Payment', icon: CreditCard },
      { key: 'confirmation', label: 'Done', icon: Check },
    ]

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((stepItem, index) => {
          const isActive = step === stepItem.key
          const isCompleted = steps.findIndex(s => s.key === step) > index
          const Icon = stepItem.icon

          return (
            <React.Fragment key={stepItem.key}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isCompleted 
                    ? "bg-green-600 text-white" 
                    : isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {stepItem.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-4",
                  isCompleted ? "bg-green-600" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gift Card Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gift Card Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gift Card Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Digital (Email)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physical" id="physical" />
                      <Label htmlFor="physical" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Physical Card
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label>Gift Card Amount</Label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={watchedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amount)}
                  className="h-12"
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-amount" className="text-sm">Custom:</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="w-24"
                min="5"
                max="5000"
                step="0.01"
              />
              <span className="text-sm text-muted-foreground">($5 - $5000)</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${watchedAmount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Gift card value
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchaser Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Details for purchase receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="purchaser_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchaser_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchaser_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="(555) 123-4567" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Recipient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Recipient Information</CardTitle>
            <CardDescription>Who will receive this gift card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="recipient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jane Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchedType === 'digital' && (
              <FormField
                control={form.control}
                name="recipient_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="jane@example.com" />
                    </FormControl>
                    <FormDescription>
                      Leave blank to send to your email instead
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="recipient_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="(555) 987-6543" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Personal Message */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Message</CardTitle>
          <CardDescription>Add a special note to the gift card</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Happy Birthday! Hope you enjoy your spa day..."
                    className="min-h-24"
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Delivery Options */}
      {watchedType === 'digital' && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Options</CardTitle>
            <CardDescription>When should we send this gift card?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!deliveryDate ? "default" : "outline"}
                  onClick={() => setDeliveryDate(undefined)}
                >
                  Send Immediately
                </Button>
                <Button
                  type="button"
                  variant={deliveryDate ? "default" : "outline"}
                  onClick={() => setDeliveryDate(addDays(new Date(), 1))}
                >
                  Schedule Delivery
                </Button>
              </div>
              
              {deliveryDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => setStep('design')}>
          Next: Choose Design
        </Button>
      </div>
    </div>
  )

  const renderDesignStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Choose Design
          </CardTitle>
          <CardDescription>
            Select a design template for your gift card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GIFT_CARD_DESIGNS.map((design) => (
              <div
                key={design.id}
                className={cn(
                  "relative border rounded-lg p-4 cursor-pointer transition-all",
                  selectedDesign === design.id 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => setSelectedDesign(design.id)}
              >
                <AspectRatio ratio={16 / 10} className="mb-3">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Gift className="h-8 w-8 text-gray-400" />
                  </div>
                </AspectRatio>
                <p className="font-medium text-sm">{design.name}</p>
                {selectedDesign === design.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Custom Upload Option */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all",
                selectedDesign === 'custom' 
                  ? "border-primary bg-primary/5" 
                  : "border-muted hover:border-muted-foreground/50"
              )}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="custom-image"
              />
              <AspectRatio ratio={16 / 10} className="mb-3">
                <div className="w-full h-full flex items-center justify-center">
                  {customImage ? (
                    <img
                      src={URL.createObjectURL(customImage)}
                      alt="Custom design"
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </AspectRatio>
              <p className="font-medium text-sm text-center">
                {customImage ? 'Custom Image' : 'Upload Custom'}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('details')}>
          Back
        </Button>
        <Button onClick={() => setStep('payment')}>
          Next: Payment
        </Button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{salonName} Gift Card</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {watchedType} • {GIFT_CARD_DESIGNS.find(d => d.id === selectedDesign)?.name || 'Custom'}
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold">${watchedAmount.toFixed(2)}</p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${watchedAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a demo payment form. In production, you would integrate with Stripe Elements or similar.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                placeholder="1234 5678 9012 3456" 
                className="font-mono"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardholder">Cardholder Name</Label>
              <Input id="cardholder" placeholder="John Doe" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="billing_address.line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 Main St" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="billing_address.line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Apt 4B" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billing_address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="San Francisco" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="billing_address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="CA" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billing_address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="94105" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="billing_address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('design')}>
          Back
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Purchase Gift Card - $${watchedAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-green-900">
          Gift Card Purchased Successfully!
        </h2>
        <p className="text-muted-foreground mt-2">
          Your ${watchedAmount.toFixed(2)} gift card has been created and will be {watchedType === 'digital' ? 'sent via email' : 'mailed to you'}.
        </p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {watchedType === 'digital' ? (
            <>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Email Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {deliveryDate 
                      ? `Gift card will be sent on ${format(deliveryDate, 'PPP')}`
                      : 'Gift card will be sent immediately to the recipient\'s email'
                    }
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Physical Card</p>
                <p className="text-sm text-muted-foreground">
                  Your gift card will be printed and mailed within 3-5 business days
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium">Ready to Use</p>
              <p className="text-sm text-muted-foreground">
                The recipient can use this gift card for any services at {salonName}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Expires in 1 Year</p>
              <p className="text-sm text-muted-foreground">
                Gift card will expire on {format(addDays(new Date(), 365), 'PPP')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={onCancel}>Close</Button>
        <Button 
          variant="outline"
          onClick={() => {
            setStep('details')
            form.reset()
            setCustomAmount('')
            setSelectedDesign(GIFT_CARD_DESIGNS[0].id)
            setCustomImage(null)
            setDeliveryDate(undefined)
          }}
        >
          Purchase Another
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Form {...form}>
        <form className="space-y-6">
          {renderStepIndicator()}

          {step === 'details' && renderDetailsStep()}
          {step === 'design' && renderDesignStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'confirmation' && renderConfirmationStep()}
        </form>
      </Form>
    </div>
  )
}