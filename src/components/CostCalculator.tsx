import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CostCalculation, BookTemplate } from '@/types';
import { luluAPI } from '@/lib/lulu-api';
import { Calculator, Truck, Clock, Zap, DollarSign } from 'lucide-react';

interface CostCalculatorProps {
  template: BookTemplate;
  pageCount: number;
  onCostCalculated: (cost: CostCalculation) => void;
}

type ShippingLevel = 'MAIL' | 'GROUND' | 'EXPRESS';

const SHIPPING_OPTIONS = [
  {
    value: 'MAIL' as ShippingLevel,
    label: 'Standard Mail',
    icon: Clock,
    description: '5-7 business days',
    color: 'text-blue-500',
  },
  {
    value: 'GROUND' as ShippingLevel,
    label: 'Ground Shipping',
    icon: Truck,
    description: '3-5 business days',
    color: 'text-green-500',
  },
  {
    value: 'EXPRESS' as ShippingLevel,
    label: 'Express Shipping',
    icon: Zap,
    description: '1-2 business days',
    color: 'text-orange-500',
  },
];

export default function CostCalculator({ template, pageCount, onCostCalculated }: CostCalculatorProps) {
  const [quantity, setQuantity] = useState(1);
  const [shippingLevel, setShippingLevel] = useState<ShippingLevel>('GROUND');
  const [costCalculation, setCostCalculation] = useState<CostCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCost = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const cost = await luluAPI.calculateCost(template.podPackageId, pageCount, quantity);
      setCostCalculation(cost);
      onCostCalculated(cost);
    } catch (err) {
      setError('Failed to calculate cost. Please try again.');
      console.error('Cost calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateCost();
  }, [template, pageCount, quantity, shippingLevel]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Cost Calculation</h2>
        <p className="text-muted-foreground">
          Get an instant quote for your book printing and shipping
        </p>
      </div>

      {/* Order Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Order Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10, 25, 50, 100].map((qty) => (
                    <SelectItem key={qty} value={qty.toString()}>
                      {qty} {qty === 1 ? 'copy' : 'copies'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Shipping Method</label>
              <Select value={shippingLevel} onValueChange={(value) => setShippingLevel(value as ShippingLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-3">Calculating costs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={calculateCost} variant="outline">
                Try Again
              </Button>
            </div>
          ) : costCalculation ? (
            <div className="space-y-4">
              {/* Cost Items */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Unit Price ({quantity} {quantity === 1 ? 'copy' : 'copies'})</span>
                  <span>{formatCurrency(costCalculation.unitPrice * quantity)}</span>
                </div>
                
                {costCalculation.discounts > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(costCalculation.discounts)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Fulfillment Fee</span>
                  <span>{formatCurrency(costCalculation.fulfillmentFee)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping ({SHIPPING_OPTIONS.find(opt => opt.value === shippingLevel)?.label})</span>
                  <span>{formatCurrency(costCalculation.shippingCost)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span>{formatCurrency(costCalculation.taxes)}</span>
                </div>
              </div>
              
              <Separator />
              
              {/* Subtotal and Total */}
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(costCalculation.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Total</span>
                  <span>{formatCurrency(costCalculation.total)}</span>
                </div>
              </div>
              
              {/* Bulk Discount Info */}
              {quantity === 1 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">💡 Pro Tip</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Order multiple copies to save on per-unit costs and shipping!
                  </p>
                </div>
              )}
              
              {/* Per Unit Cost */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Cost per copy</span>
                  <span className="font-medium">{formatCurrency(costCalculation.total / quantity)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cost calculation available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Book Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Book Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Format</p>
              <p className="text-muted-foreground">{template.name}</p>
            </div>
            <div>
              <p className="font-medium">Size</p>
              <p className="text-muted-foreground">{template.dimensions.width}" × {template.dimensions.height}"</p>
            </div>
            <div>
              <p className="font-medium">Pages</p>
              <p className="text-muted-foreground">{pageCount}</p>
            </div>
            <div>
              <p className="font-medium">Paper</p>
              <p className="text-muted-foreground">60# White</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}