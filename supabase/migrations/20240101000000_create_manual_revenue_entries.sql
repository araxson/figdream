-- Create manual revenue entries table
CREATE TABLE IF NOT EXISTS public.manual_revenue_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    description TEXT,
    payment_method TEXT,
    staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    service_type TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add constraint to prevent duplicate entries for same date/category
    UNIQUE(salon_id, entry_date, category, description)
);

-- Create index for faster queries
CREATE INDEX idx_manual_revenue_salon_date ON public.manual_revenue_entries(salon_id, entry_date DESC);
CREATE INDEX idx_manual_revenue_salon_category ON public.manual_revenue_entries(salon_id, category);
CREATE INDEX idx_manual_revenue_staff ON public.manual_revenue_entries(staff_id) WHERE staff_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.manual_revenue_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view revenue entries for their salon"
    ON public.manual_revenue_entries
    FOR SELECT
    USING (
        salon_id IN (
            SELECT id FROM public.salons 
            WHERE created_by = auth.uid()
            UNION
            SELECT salon_id FROM public.staff_profiles 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Salon owners can insert revenue entries"
    ON public.manual_revenue_entries
    FOR INSERT
    WITH CHECK (
        salon_id IN (
            SELECT id FROM public.salons 
            WHERE created_by = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Salon owners can update their revenue entries"
    ON public.manual_revenue_entries
    FOR UPDATE
    USING (
        salon_id IN (
            SELECT id FROM public.salons 
            WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Salon owners can delete their revenue entries"
    ON public.manual_revenue_entries
    FOR DELETE
    USING (
        salon_id IN (
            SELECT id FROM public.salons 
            WHERE created_by = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_manual_revenue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_manual_revenue_entries_updated_at
    BEFORE UPDATE ON public.manual_revenue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_manual_revenue_updated_at();

-- Create enum for revenue categories
CREATE TYPE revenue_category AS ENUM (
    'service',
    'product_sales',
    'gift_cards',
    'membership',
    'tips',
    'other'
);

-- Create enum for payment methods
CREATE TYPE payment_method AS ENUM (
    'cash',
    'card',
    'bank_transfer',
    'check',
    'digital_wallet',
    'other'
);

-- Update the table to use enums
ALTER TABLE public.manual_revenue_entries 
    ALTER COLUMN category TYPE revenue_category USING category::revenue_category,
    ALTER COLUMN payment_method TYPE payment_method USING payment_method::payment_method;

-- Add comment to table
COMMENT ON TABLE public.manual_revenue_entries IS 'Manual revenue entries for salons without POS integration';