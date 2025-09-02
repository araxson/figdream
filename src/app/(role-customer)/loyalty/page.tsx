import { createClient } from '@/lib/database/supabase/server';
import { 
  getCustomerByUserId, 
  getCustomerLoyaltyPoints, 
  getCustomerLoyaltyTransactions 
} from '@/lib/data-access/customers';
import { getCustomerLoyalty } from '@/lib/data-access/loyalty/loyalty-program';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Progress, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  Gift, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Star,
  Calendar,
  ShoppingBag,
  Trophy,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CustomerLoyaltyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  const currentPoints = await getCustomerLoyaltyPoints(customer.id);
  const transactions = await getCustomerLoyaltyTransactions(customer.id);

  // Get loyalty program details
  let loyaltyProgram = null;
  let loyaltyData = null;
  if (customer.salon_id) {
    const { data } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('salon_id', customer.salon_id)
      .eq('is_active', true)
      .single();
    loyaltyProgram = data;
    
    // Get customer loyalty data with tier information
    if (loyaltyProgram) {
      try {
        loyaltyData = await getCustomerLoyalty(customer.id, loyaltyProgram.id);
      } catch (error) {
        console.error('Failed to get loyalty data:', error);
      }
    }
  }

  // Calculate statistics
  const pointsEarned = transactions?.filter(t => t.points && t.points > 0)
    .reduce((sum, t) => sum + t.points, 0) || 0;
  
  const pointsRedeemed = Math.abs(transactions?.filter(t => t.points && t.points < 0)
    .reduce((sum, t) => sum + t.points, 0) || 0);

  const recentTransactions = transactions?.slice(0, 10) || [];
  
  // Get tier information from loyalty data or use defaults
  const tierColors: Record<string, string> = {
    'Bronze': 'bg-orange-100 text-orange-800',
    'Silver': 'bg-gray-100 text-gray-800',
    'Gold': 'bg-yellow-100 text-yellow-800',
    'Platinum': 'bg-purple-100 text-purple-800'
  };
  
  const currentTier = loyaltyData?.data?.current_tier || 'Bronze';
  const nextTier = loyaltyData?.data?.next_tier;
  const tierProgress = loyaltyData?.data?.tier_progress || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'appointment':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'redeemed':
      case 'redemption':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-blue-500" />;
      case 'referral':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Rewards</h1>
        <p className="mt-2 text-gray-600">
          Track your points and redeem rewards
        </p>
      </div>

      {/* Points Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available points
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Points Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{pointsEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Points Redeemed
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{pointsRedeemed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total redeemed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membership Status</CardTitle>
              <CardDescription>
                Your current tier and progress to the next level
              </CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Badge className={tierColors[currentTier] || 'bg-gray-100 text-gray-800'} style={{ cursor: 'pointer' }}>
                  <Award className="mr-1 h-3 w-3" />
                  {currentTier} Member
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">{currentTier} Tier Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Priority booking access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{currentTier.name === 'Bronze' ? '5%' : currentTier.name === 'Silver' ? '10%' : currentTier.name === 'Gold' ? '15%' : '20%'} bonus points on services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Exclusive member rewards</span>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Points range: {currentTier.minPoints}{currentTier.maxPoints ? ` - ${currentTier.maxPoints}` : '+'} points
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tier Progress</span>
              {nextTier && (
                <span className="text-sm text-gray-600">
                  {nextTier.minPoints - currentPoints} points to {nextTier.name}
                </span>
              )}
            </div>
            <Progress value={tierProgress} className="h-3" />
          </div>
          
          {loyaltyProgram && (
            <Accordion type="single" collapsible className="w-full pt-4 border-t">
              <AccordionItem value="benefits">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>Program Benefits & Redemption Guide</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 md:grid-cols-2 pt-2">
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Program Benefits
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 mt-1 text-green-500" />
                          <span>Earn {loyaltyProgram.points_per_dollar || 1} point per dollar spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Calendar className="h-3 w-3 mt-1 text-blue-500" />
                          <span>Birthday bonus points (2x multiplier)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Trophy className="h-3 w-3 mt-1 text-purple-500" />
                          <span>Exclusive member discounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-3 w-3 mt-1 text-orange-500" />
                          <span>Early access to promotions</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-red-500" />
                        Redemption Options
                      </p>
                      <div className="space-y-2 text-sm text-gray-600">
                        {[
                          { points: 100, reward: '$5 off services', icon: <TrendingDown className="h-3 w-3 text-green-500" /> },
                          { points: 500, reward: 'Free add-on service', icon: <Gift className="h-3 w-3 text-blue-500" /> },
                          { points: 1000, reward: '20% off any service', icon: <Trophy className="h-3 w-3 text-purple-500" /> },
                          { points: 2000, reward: 'Free premium service', icon: <Award className="h-3 w-3 text-yellow-500" /> }
                        ].map((option) => (
                          <div key={option.points} className="flex items-start gap-2">
                            {option.icon}
                            <span>{option.points} points = {option.reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your points earning and redemption history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-3 pr-4">
                    {recentTransactions.map((transaction) => (
                      <ContextMenu key={transaction.id}>
                        <ContextMenuTrigger asChild>
                          <Card className="cursor-context-menu hover:bg-muted/50 transition-colors">
                            <CardContent className="flex items-center justify-between p-3">
                              <div className="flex items-start gap-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex-shrink-0">
                                        {getTransactionIcon(transaction.type || '')}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Transaction type: {transaction.type || 'unknown'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div>
                                  <p className="font-medium text-sm">
                                    {transaction.description || 'Points transaction'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={transaction.points && transaction.points > 0 ? "default" : "destructive"}>
                                  {transaction.points && transaction.points > 0 ? '+' : ''}
                                  {transaction.points} pts
                                </Badge>
                                {transaction.appointment_id && (
                                  <Link 
                                    href={`/customer/appointments/${transaction.appointment_id}`}
                                    className="block text-xs text-blue-600 hover:underline mt-1"
                                  >
                                    View appointment
                                  </Link>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem>
                            <Trophy className="mr-2 h-4 w-4" />
                            View Details
                          </ContextMenuItem>
                          {transaction.appointment_id && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Appointment
                              </ContextMenuItem>
                            </>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start earning points with your next appointment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Your Points</CardTitle>
              <CardDescription>
                Choose from available rewards based on your point balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { points: 100, title: '$5 Off', description: 'Any service', available: currentPoints >= 100, icon: <TrendingDown className="h-4 w-4" />, color: 'green' },
                  { points: 250, title: '$15 Off', description: 'Services over $50', available: currentPoints >= 250, icon: <TrendingDown className="h-4 w-4" />, color: 'blue' },
                  { points: 500, title: 'Free Add-On', description: 'Conditioning treatment', available: currentPoints >= 500, icon: <Gift className="h-4 w-4" />, color: 'purple' },
                  { points: 1000, title: '20% Off', description: 'Any service', available: currentPoints >= 1000, icon: <Trophy className="h-4 w-4" />, color: 'yellow' },
                  { points: 1500, title: 'Free Service', description: 'Up to $75 value', available: currentPoints >= 1500, icon: <Award className="h-4 w-4" />, color: 'orange' },
                  { points: 2000, title: 'Premium Package', description: 'Full service package', available: currentPoints >= 2000, icon: <Star className="h-4 w-4" />, color: 'pink' },
                ].map((reward) => (
                  <Card 
                    key={reward.points}
                    className={`transition-all hover:shadow-md ${
                      reward.available 
                        ? 'border-blue-200 bg-blue-50/30' 
                        : 'opacity-60'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg bg-${reward.color}-100 text-${reward.color}-600`}>
                            {reward.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{reward.title}</p>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {reward.points} points
                            </Badge>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                disabled={!reward.available}
                                variant={reward.available ? "default" : "secondary"}
                              >
                                Redeem
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {reward.available ? (
                                <p>Click to redeem this reward</p>
                              ) : (
                                <p>Need {reward.points - currentPoints} more points</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert className="mt-6">
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Pro Tip: </span>
                  Book regular appointments to maximize your points earning. 
                  Members earn bonus points on their birthday month!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}