"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, Avatar, AvatarFallback, AvatarImage, Slider } from "@/components/ui"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, ZoomIn, RotateCw } from "lucide-react"
interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userName?: string
  onUploadComplete?: (url: string) => void
}
export function AvatarUpload({ userId, currentAvatarUrl, userName, onUploadComplete }: AvatarUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [zoom, setZoom] = useState([1])
  const [rotation, setRotation] = useState(0)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      })
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
      setIsOpen(true)
    }
    reader.readAsDataURL(file)
  }
  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("userId", userId)
      formData.append("zoom", zoom[0].toString())
      formData.append("rotation", rotation.toString())
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Upload failed")
      }
      const { url } = await response.json()
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
      onUploadComplete?.(url)
      setIsOpen(false)
      resetState()
    } catch (_error) {
      toast({
        title: "Upload failed",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }
  const resetState = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setZoom([1])
    setRotation(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
            <AvatarFallback className="text-2xl">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Photo
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Your Photo</DialogTitle>
            <DialogDescription>
              Zoom and rotate your photo to get the perfect profile picture
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && (
              <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom[0]}) rotate(${rotation}deg)`,
                  }}
                >
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(zoom[0] * 100)}%
                  </span>
                </div>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Rotation</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRotate}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotate 90°
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  resetState()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Save Photo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}