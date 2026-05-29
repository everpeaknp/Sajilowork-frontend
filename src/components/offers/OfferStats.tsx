'use client';

/**
 * OfferStats Component
 * 
 * Displays statistics and insights about received offers
 * Features:
 * - Total offers count
 * - Average offer amount
 * - Lowest/highest offers
 * - Average completion time
 * - Response rate
 */

import { Bid, Task } from '@/types';
import { TrendingDown, Clock, DollarSign, Users, Award } from 'lucide-react';

interface OfferStatsProps {
  offers: Bid[];
  task: Task;
}

export function OfferStats({ offers, task }: OfferStatsProps) {
  // Calculate statistics
  const totalOffers = offers.length;
  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;

  const amounts = offers.map(o => o.amount);
  const averageAmount = amounts.length > 0
    ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    : 0;
  const lowestAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  const durations = offers.map(o => o.estimated_duration || 0);
  const averageDuration = durations.length > 0
    ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    : 0;

  // Calculate savings compared to budget
  const budgetSavings = task.budget_amount && lowestAmount > 0
    ? task.budget_amount - lowestAmount
    : 0;
  const savingsPercentage = task.budget_amount && budgetSavings > 0
    ? (budgetSavings / task.budget_amount) * 100
    : 0;

  // Get top-rated providers
  const topRatedProviders = offers
    .filter(o => o.tasker.average_rating)
    .sort((a, b) => (b.tasker.average_rating || 0) - (a.tasker.average_rating || 0))
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Offers */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{totalOffers}</span>
          </div>
          <p className="text-sm text-gray-600">Total Offers</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-yellow-600">{pendingOffers} pending</span>
            <span className="text-gray-400">•</span>
            <span className="text-green-600">{acceptedOffers} accepted</span>
          </div>
        </div>

        {/* Average Amount */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              NPR {Math.round(averageAmount).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">Average Offer</p>
          {task.budget_amount && (
            <p className="text-xs text-gray-500 mt-2">
              Budget: NPR {task.budget_amount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Lowest Offer */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              NPR {lowestAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">Lowest Offer</p>
          {budgetSavings > 0 && (
            <p className="text-xs text-green-600 mt-2">
              Save NPR {budgetSavings.toLocaleString()} ({savingsPercentage.toFixed(0)}%)
            </p>
          )}
        </div>

        {/* Average Duration */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(averageDuration)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Avg. Days</p>
          <p className="text-xs text-gray-500 mt-2">
            Completion time
          </p>
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Price Range</h4>
          <span className="text-xs text-gray-500">
            NPR {lowestAmount.toLocaleString()} - NPR {highestAmount.toLocaleString()}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            style={{
              width: task.budget_amount
                ? `${Math.min(100, (lowestAmount / task.budget_amount) * 100)}%`
                : '50%',
            }}
          />
          {task.budget_amount && (
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500"
              style={{
                left: '100%',
              }}
              title={`Budget: NPR ${task.budget_amount.toLocaleString()}`}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Lowest</span>
          {task.budget_amount && <span>Budget: NPR {task.budget_amount.toLocaleString()}</span>}
          <span>Highest</span>
        </div>
      </div>

      {/* Top Rated Providers */}
      {topRatedProviders.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-yellow-500" />
            <h4 className="text-sm font-medium text-gray-700">Top Rated Providers</h4>
          </div>
          <div className="space-y-2">
            {topRatedProviders.map((offer, index) => (
              <div key={offer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-4">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900">
                    {offer.tasker.first_name} {offer.tasker.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {offer.tasker.average_rating?.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({offer.tasker.total_reviews} reviews)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {pendingOffers > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Recommendations</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {lowestAmount < averageAmount * 0.8 && (
              <li>• Consider the lowest offer - it's significantly below average</li>
            )}
            {topRatedProviders.length > 0 && topRatedProviders[0].tasker.average_rating && topRatedProviders[0].tasker.average_rating >= 4.5 && (
              <li>• Top-rated provider available with {topRatedProviders[0].tasker.average_rating.toFixed(1)}★ rating</li>
            )}
            {averageDuration < 7 && (
              <li>• Quick turnaround available - average {Math.round(averageDuration)} days</li>
            )}
            {pendingOffers >= 5 && (
              <li>• High interest - {pendingOffers} providers want to work on this task</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
