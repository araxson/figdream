'use client';

import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSalon } from '@/lib/contexts/salon-context';
import { useState } from 'react';

export function SalonSelector() {
  const { currentSalon, salons, isAdmin, selectSalon, isLoading } = useSalon();
  const [open, setOpen] = useState(false);

  // Only show for admins with multiple salons
  if (!isAdmin || salons.length <= 1 || isLoading) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentSalon?.name || 'Select salon...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search salon..." />
          <CommandEmpty>No salon found.</CommandEmpty>
          <CommandGroup>
            {salons.map((salon) => (
              <CommandItem
                key={salon.id}
                value={salon.name}
                onSelect={() => {
                  selectSalon(salon.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentSalon?.id === salon.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {salon.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}