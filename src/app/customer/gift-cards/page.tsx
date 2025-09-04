import { Metadata } from 'next'
import { GiftCardList } from '@/components/customer/gift-cards/gift-card-list'
import { GiftCardPurchaseForm } from '@/components/customer/gift-cards/gift-card-purchase-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Gift Cards',
  description: 'Manage your gift cards',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
        <p className="text-muted-foreground">Purchase and manage your gift cards</p>
      </div>
      
      <Tabs defaultValue="my-cards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-cards">My Gift Cards</TabsTrigger>
          <TabsTrigger value="purchase">Purchase New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-cards">
          <GiftCardList />
        </TabsContent>
        
        <TabsContent value="purchase">
          <GiftCardPurchaseForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
