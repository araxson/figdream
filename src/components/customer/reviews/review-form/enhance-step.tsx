'use client'
import * as React from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { REVIEW_TAGS } from './review-form.constants'
import { PhotoUpload } from './review-form.types'
import { Control } from 'react-hook-form'
import { CreateReviewInput } from '@/lib/validations/review-schema'

interface EnhanceStepProps {
  control: Control<CreateReviewInput>
  uploadedPhotos: PhotoUpload[]
  selectedTags: string[]
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: (index: number) => void
  onUpdatePhotoCaption: (index: number, caption: string) => void
  onTagToggle: (tag: string) => void
  disabled?: boolean
}

export function EnhanceStep({
  control,
  uploadedPhotos,
  selectedTags,
  onPhotoUpload,
  onRemovePhoto,
  onUpdatePhotoCaption,
  onTagToggle,
  disabled
}: EnhanceStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Enhance Your Review</h3>
        <p className="text-muted-foreground">
          Add photos and tags to make your review more helpful
        </p>
      </div>
      
      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Add Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <AspectRatio ratio={1}>
                    <Image 
                      src={photo.url} 
                      alt={`Review photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </AspectRatio>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => onRemovePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Input
                    placeholder="Add caption..."
                    value={photo.caption}
                    onChange={(e) => onUpdatePhotoCaption(index, e.target.value)}
                    maxLength={200}
                  />
                </div>
              ))}
            </div>
          )}
          {uploadedPhotos.length < 10 && (
            <Card>
              <CardContent>
                <div className="text-center space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload photos of your results</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 5MB each. Maximum 10 photos.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPhotoUpload}
                      disabled={disabled}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={disabled}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Photos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tags Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Award className="h-5 w-5 inline-block mr-2" />
            What did you like?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click tags to add them to your review
          </p>
        </CardContent>
      </Card>

      {/* Privacy Options */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="is_anonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Post this review anonymously</FormLabel>
                  <FormDescription>
                    Your name won&apos;t be shown with this review
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}