"use client"

import { useState } from "react"
import { type TableRow } from "./columns"
import {
  ArrowRightCircle,
  FileText,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TableCellViewer({ item }: { item: TableRow }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="justify-start truncate px-2.5"
        onClick={() => setIsDialogOpen(true)}
      >
        <FileText className="h-4 w-4" />
        {item.header}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild />
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[42rem]"
        >
          <DialogHeader>
            <DialogTitle>{item.header}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[200px] md:h-[300px] lg:h-[400px]">
            <div className="p-4">
              <p className="text-muted-foreground">
                This is where the content for {item.header} would be displayed.
                This component can be extended to show full document content,
                preview, or any other detailed information.
              </p>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4" />
                Improve
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsNavigating(true)
                setTimeout(() => {
                  setIsNavigating(false)
                  setIsDialogOpen(false)
                }, 1000)
              }}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ArrowRightCircle className="h-4 w-4" />
                  Open
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}