import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Car } from '@shared/schema';
import { formatEurPrice } from '@/lib/conversion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface BudgetDashboardProps {
  selectedCar?: Car | null;
}

export default function BudgetDashboard({ selectedCar }: BudgetDashboardProps) {
  const { toast } = useToast();
  const [carPrice, setCarPrice] = useState(selectedCar?.price || 30000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20);
  const [savingsData, setSavingsData] = useState<Array<{ month: string; amount: number }>>([]);
  const [targetDownPayment, setTargetDownPayment] = useState(carPrice * (downPaymentPercentage / 100));
  const [monthsToGoal, setMonthsToGoal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTerm, setLoanTerm] = useState(60); // 60 months = 5 years
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Calculate down payment, progress and months to goal
  useEffect(() => {
    const target = carPrice * (downPaymentPercentage / 100);
    setTargetDownPayment(target);
    
    // Calculate progress percentage
    const newProgress = currentSavings > 0 ? (currentSavings / target) * 100 : 0;
    setProgress(Math.min(newProgress, 100));
    
    // Calculate months to goal
    if (monthlySavings > 0) {
      const remaining = target - currentSavings;
      const months = Math.ceil(remaining / monthlySavings);
      setMonthsToGoal(months > 0 ? months : 0);
    } else {
      setMonthsToGoal(0);
    }

    // Calculate loan amount and monthly payment
    const loan = carPrice - currentSavings;
    setLoanAmount(loan > 0 ? loan : 0);

    // Calculate monthly payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    // where L = loan amount, c = monthly interest rate, n = number of payments
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate > 0 && loanTerm > 0) {
      const payment = loan * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                      (Math.pow(1 + monthlyRate, loanTerm) - 1);
      setMonthlyPayment(payment > 0 ? payment : 0);
    } else {
      setMonthlyPayment(loan / loanTerm);
    }
  }, [carPrice, currentSavings, monthlySavings, downPaymentPercentage, interestRate, loanTerm]);

  // Generate savings projection data for the chart
  useEffect(() => {
    const data = [];
    let totalSaved = currentSavings;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    data.push({
      month: `${monthNames[currentMonth]} ${currentYear}`,
      amount: totalSaved
    });

    for (let i = 1; i <= 24; i++) {
      totalSaved += monthlySavings;
      currentMonth++;
      
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      
      data.push({
        month: `${monthNames[currentMonth]} ${currentYear}`,
        amount: totalSaved
      });

      // Stop projecting once we reach the target
      if (totalSaved >= targetDownPayment) {
        break;
      }
    }

    setSavingsData(data);
  }, [currentSavings, monthlySavings, targetDownPayment]);

  const handleAddSavings = () => {
    setCurrentSavings(currentSavings + monthlySavings);
    toast({
      title: "Savings Updated",
      description: `Added ${formatEurPrice(monthlySavings)} to your savings!`,
    });
  };

  const handleResetSavings = () => {
    setCurrentSavings(0);
    toast({
      title: "Savings Reset",
      description: "Your savings have been reset to zero.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Car Budget Dashboard</CardTitle>
          <CardDescription>
            Plan your car purchase and track your savings progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="savings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="savings">Savings Tracker</TabsTrigger>
              <TabsTrigger value="loan">Loan Calculator</TabsTrigger>
              <TabsTrigger value="projection">Savings Projection</TabsTrigger>
            </TabsList>
            
            <TabsContent value="savings">
              <div className="grid gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="car-price">Car Price:</Label>
                    <div className="font-medium">{formatEurPrice(carPrice)}</div>
                  </div>
                  <Input
                    id="car-price"
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="down-payment-percentage">Down Payment ({downPaymentPercentage}%):</Label>
                    <div className="font-medium">{formatEurPrice(targetDownPayment)}</div>
                  </div>
                  <Slider
                    id="down-payment-percentage"
                    min={0}
                    max={100}
                    step={5}
                    value={[downPaymentPercentage]}
                    onValueChange={(value) => setDownPaymentPercentage(value[0])}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="current-savings">Current Savings:</Label>
                    <div className="font-medium">{formatEurPrice(currentSavings)}</div>
                  </div>
                  <Input
                    id="current-savings"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="monthly-savings">Monthly Contribution:</Label>
                    <div className="font-medium">{formatEurPrice(monthlySavings)}</div>
                  </div>
                  <Input
                    id="monthly-savings"
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Savings Progress:</Label>
                  <div className="h-8 relative w-full">
                    <Progress value={progress} className="h-full" />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-sm font-medium mix-blend-difference text-white">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Down Payment</p>
                      <p className="text-2xl font-bold">{formatEurPrice(targetDownPayment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Months to Goal</p>
                      <p className="text-2xl font-bold">{monthsToGoal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Savings</p>
                      <p className="text-2xl font-bold">{formatEurPrice(currentSavings)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Still Needed</p>
                      <p className="text-2xl font-bold">{formatEurPrice(Math.max(0, targetDownPayment - currentSavings))}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAddSavings} className="flex-1">
                  Add Monthly Savings
                </Button>
                <Button onClick={handleResetSavings} variant="outline" className="flex-1">
                  Reset Savings
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="loan">
              <div className="grid gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="loan-amount">Loan Amount:</Label>
                    <div className="font-medium">{formatEurPrice(loanAmount)}</div>
                  </div>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="mt-1"
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="interest-rate">Interest Rate ({interestRate}%):</Label>
                  </div>
                  <Slider
                    id="interest-rate"
                    min={0}
                    max={20}
                    step={0.1}
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="loan-term">Loan Term ({loanTerm} months):</Label>
                  </div>
                  <Slider
                    id="loan-term"
                    min={12}
                    max={84}
                    step={12}
                    value={[loanTerm]}
                    onValueChange={(value) => setLoanTerm(value[0])}
                    className="mt-1"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-2xl font-bold">{formatEurPrice(monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold">{formatEurPrice(monthlyPayment * loanTerm)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-2xl font-bold">{formatEurPrice((monthlyPayment * loanTerm) - loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Term</p>
                      <p className="text-2xl font-bold">{Math.floor(loanTerm / 12)} years</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projection">
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={savingsData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
                    <YAxis 
                      tickFormatter={(value) => `€${Math.round(value/1000)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`€${value.toLocaleString()}`, 'Savings']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    {/* Add a reference line for the target down payment */}
                    <CartesianGrid y={targetDownPayment} stroke="red" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="flex items-center space-x-2 mt-4">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Down Payment Target: {formatEurPrice(targetDownPayment)}</span>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Savings Projection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  At your current monthly contribution of {formatEurPrice(monthlySavings)}, 
                  you'll reach your down payment goal of {formatEurPrice(targetDownPayment)} in approximately {monthsToGoal} months.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Goal Date</p>
                    <p className="font-semibold">
                      {monthsToGoal > 0 ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'long'
                      }) : 'Already reached!'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className="font-semibold">{formatEurPrice(monthlySavings)} / month</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => setMonthlySavings(monthlySavings + 100)} className="flex-1">
                  Increase Monthly Savings
                </Button>
                <Button 
                  onClick={() => setMonthlySavings(Math.max(0, monthlySavings - 100))} 
                  variant="outline" 
                  className="flex-1"
                >
                  Decrease Monthly Savings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            * This is a simulation tool. Actual loan terms and rates may vary.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}