"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { flexRender, Row } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { type TableRow as TableRowType } from "./columns"

interface SortableRowProps {
  row: Row<TableRowType>
}

export function SortableRow({ row }: SortableRowProps) {
  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-state={row.getIsSelected() && "selected"}
      className={isDragging ? "opacity-50" : ""}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}