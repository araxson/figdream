import { createClient } from '@/lib/database/supabase/server';
import { 
  getCustomerByUserId, 
  getCustomerLoyaltyPoints, 
  getCustomerLoyaltyTransactions 
} from '@/lib/data-access/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { data: loyaltyProgram } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('salon_id', customer.salon_id)
    .eq('is_active', true)
    .single();

  // Calculate statistics
  const pointsEarned = transactions?.filter(t => t.points && t.points > 0)
    .reduce((sum, t) => sum + t.points, 0) || 0;
  
  const pointsRedeemed = Math.abs(transactions?.filter(t => t.points && t.points < 0)
    .reduce((sum, t) => sum + t.points, 0) || 0);

  const recentTransactions = transactions?.slice(0, 10) || [];
  
  // Calculate tier progress (example tiers)
  const tiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 500, color: 'bg-orange-100 text-orange-800' },
    { name: 'Silver', minPoints: 501, maxPoints: 1500, color: 'bg-gray-100 text-gray-800' },
    { name: 'Gold', minPoints: 1501, maxPoints: 3000, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Platinum', minPoints: 3001, maxPoints: null, color: 'bg-purple-100 text-purple-800' }
  ];

  const currentTier = tiers.find(tier => 
    currentPoints >= tier.minPoints && 
    (tier.maxPoints === null || currentPoints <= tier.maxPoints)
  ) || tiers[0];

  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const tierProgress = nextTier 
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

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
            <Badge className={currentTier.color}>
              <Award className="mr-1 h-3 w-3" />
              {currentTier.name} Member
            </Badge>
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
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div>
                <p className="text-sm font-medium mb-2">Program Benefits</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Earn {loyaltyProgram.points_per_dollar || 1} point per dollar spent</li>
                  <li>• Birthday bonus points</li>
                  <li>• Exclusive member discounts</li>
                  <li>• Early access to promotions</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Redemption Options</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 100 points = $5 off services</li>
                  <li>• 500 points = Free add-on service</li>
                  <li>• 1000 points = 20% off any service</li>
                  <li>• 2000 points = Free premium service</li>
                </ul>
              </div>
            </div>
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
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        {getTransactionIcon(transaction.transaction_type || '')}
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description || 'Points transaction'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.points && transaction.points > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.points && transaction.points > 0 ? '+' : ''}
                          {transaction.points} pts
                        </p>
                        {transaction.appointment_id && (
                          <Link 
                            href={`/customer/appointments/${transaction.appointment_id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View appointment
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  { points: 100, title: '$5 Off', description: 'Any service', available: currentPoints >= 100 },
                  { points: 250, title: '$15 Off', description: 'Services over $50', available: currentPoints >= 250 },
                  { points: 500, title: 'Free Add-On', description: 'Conditioning treatment', available: currentPoints >= 500 },
                  { points: 1000, title: '20% Off', description: 'Any service', available: currentPoints >= 1000 },
                  { points: 1500, title: 'Free Service', description: 'Up to $75 value', available: currentPoints >= 1500 },
                  { points: 2000, title: 'Premium Package', description: 'Full service package', available: currentPoints >= 2000 },
                ].map((reward) => (
                  <div 
                    key={reward.points}
                    className={`p-4 border rounded-lg ${
                      reward.available 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{reward.title}</p>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                        <p className="text-xs mt-2">
                          <span className="font-medium">{reward.points} points</span>
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!reward.available}
                        variant={reward.available ? "default" : "secondary"}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Pro Tip</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Book regular appointments to maximize your points earning. 
                      Members earn bonus points on their birthday month!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}