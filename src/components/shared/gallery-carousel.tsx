'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  AspectRatio,
  Card,
  Dialog,
  DialogContent,
} from '@/components/ui'
import Autoplay from 'embla-carousel-autoplay'

interface GalleryImage {
  id: string
  url: string
  caption?: string
  category?: string
}

interface GalleryCarouselProps {
  images: GalleryImage[]
  autoplay?: boolean
  showThumbnails?: boolean
  aspectRatio?: number
  className?: string
}

export function GalleryCarousel({
  images,
  autoplay = false,
  showThumbnails = false,
  aspectRatio = 16 / 9,
  className
}: GalleryCarouselProps) {
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null)
  const [api, setApi] = React.useState<any>()
  const [current, setCurrent] = React.useState(0)
  
  const plugin = React.useRef(
    autoplay ? Autoplay({ delay: 4000, stopOnInteraction: true }) : undefined
  )

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <>
      <div className={className}>
        <Carousel
          setApi={setApi}
          plugins={plugin.current ? [plugin.current] : []}
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <Card 
                  className="overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <AspectRatio ratio={aspectRatio}>
                    <img
                      src={image.url}
                      alt={image.caption || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  )}
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        {showThumbnails && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <Button
                key={image.id}
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollTo(index)}
                className={`flex-shrink-0 transition-opacity h-auto w-auto p-1 ${
                  current === index ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <AspectRatio ratio={1} className="w-16">
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </AspectRatio>
              </Button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="relative">
              <AspectRatio ratio={aspectRatio}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Gallery image'}
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
              {selectedImage.caption && (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}