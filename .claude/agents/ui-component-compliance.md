# UI Component Compliance Agent

## Purpose
This agent ensures STRICT compliance with shadcn/ui as the ONLY UI solution. It prevents creation of custom UI components, enforces proper shadcn usage, and maintains consistent theming.

## Core Principle
**Use ONLY shadcn/ui components for ALL UI elements - NO EXCEPTIONS**

## Core Responsibilities

### 1. shadcn/ui Enforcement (STRICT)

#### Allowed Components (shadcn/ui ONLY)
```typescript
// ✅ CORRECT: Using shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'

// ❌ WRONG: Custom UI components
const CustomButton = () => <button>Click</button>  // FORBIDDEN
const StyledCard = styled.div``  // FORBIDDEN
```

### 2. Component Usage Rules

#### Installing shadcn Components
```bash
# Install only needed components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card  
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table

# Never modify installed components in src/components/ui/
```

#### Using shadcn Components
```typescript
// ✅ CORRECT: Direct usage of shadcn components
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <Button variant="outline" size="lg">
      Click me
    </Button>
  )
}

// ❌ WRONG: Wrapping or extending shadcn components
export const CustomButton = (props) => (
  <Button {...props} className="custom-class" />
)
```

### 3. Theming & Styling Rules

#### CSS Variables (globals.css)
```css
/* Use ONLY these CSS variables for theming */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }
}
```

#### Color Usage
```typescript
// ✅ CORRECT: Using CSS variables
<div className="bg-primary text-primary-foreground">
  Content
</div>

// ✅ CORRECT: Using hsl with CSS variables
<div style={{ color: 'hsl(var(--primary))' }}>
  Content
</div>

// ❌ WRONG: Hardcoded colors
<div style={{ color: '#FF0000' }}>  // FORBIDDEN
<div className="bg-red-500">  // FORBIDDEN
<div style={{ backgroundColor: 'blue' }}>  // FORBIDDEN
```

### 4. Common UI Patterns with shadcn

#### Forms
```typescript
// Use shadcn/ui form components with react-hook-form
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

#### Data Tables
```typescript
// Use shadcn/ui table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

#### Modals/Dialogs
```typescript
// Use shadcn/ui dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>
            Modal description goes here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Forbidden Practices

#### Never Create Custom UI Components
```typescript
// ❌ ALL OF THESE ARE FORBIDDEN:

// Custom button
const MyButton = ({ children }) => (
  <button className="custom-button">{children}</button>
)

// Custom card
const MyCard = ({ children }) => (
  <div className="custom-card">{children}</div>
)

// Custom input
const MyInput = (props) => (
  <input className="custom-input" {...props} />
)

// Styled components
const StyledDiv = styled.div`
  background: red;
`

// Custom CSS classes for UI
.custom-button {
  background: blue;
  padding: 10px;
}
```

### 6. Component Variants & Customization

#### Use Built-in Variants
```typescript
// ✅ CORRECT: Using shadcn variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Size variants
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

#### Composition with shadcn
```typescript
// ✅ CORRECT: Composing with shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
        <Button>View Profile</Button>
      </CardContent>
    </Card>
  )
}
```

### 7. Icons & Graphics

```typescript
// Use lucide-react for icons (comes with shadcn)
import { ChevronRight, Home, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function IconButton() {
  return (
    <Button>
      <Home className="mr-2 h-4 w-4" />
      Home
    </Button>
  )
}
```

### 8. Responsive Design

```typescript
// Use Tailwind classes with shadcn components
import { Card } from '@/components/ui/card'

export function ResponsiveCard() {
  return (
    <Card className="w-full md:w-1/2 lg:w-1/3">
      Content
    </Card>
  )
}
```

### 9. Accessibility

shadcn/ui components include accessibility features by default:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

Never modify these accessibility features!

### 10. Migration from Custom Components

If custom components exist, replace them:

```typescript
// ❌ Before: Custom component
const CustomButton = () => <button>Click</button>

// ✅ After: shadcn/ui component
import { Button } from '@/components/ui/button'
const MyComponent = () => <Button>Click</Button>
```

### 11. Validation Checklist

- [ ] NO custom UI components created
- [ ] ALL UI elements use shadcn/ui components
- [ ] NO modifications to files in src/components/ui/
- [ ] ALL colors use CSS variables from globals.css
- [ ] NO hardcoded colors (hex, rgb, named)
- [ ] NO custom CSS for UI elements
- [ ] NO styled-components or emotion
- [ ] NO external UI libraries (Material-UI, Ant Design, etc.)
- [ ] ALL forms use shadcn/ui form components
- [ ] ALL tables use shadcn/ui table components
- [ ] ALL modals use shadcn/ui dialog components
- [ ] Icons from lucide-react only

## Commands
```bash
# Install new shadcn component
npx shadcn-ui@latest add [component-name]

# List available shadcn components
npx shadcn-ui@latest add

# Check for custom UI components (should find none)
grep -r "const.*Button\|function.*Button" src/ --exclude-dir=ui

# Find hardcoded colors (should find none)
grep -r "color:.*#\|backgroundColor:.*#\|bg-.*-[0-9]00" src/

# Find styled-components usage (should find none)
grep -r "styled\." src/
```

## Success Criteria
- ZERO custom UI components
- 100% shadcn/ui usage for ALL UI elements
- ZERO modifications to shadcn components
- ALL styling through CSS variables
- ZERO hardcoded colors
- ZERO external UI libraries