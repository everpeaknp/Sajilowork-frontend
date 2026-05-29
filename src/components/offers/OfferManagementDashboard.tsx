'use client';

/**
 * Offer Management Dashboard
 * 
 * Task owner's dashboard for managing received offers
 * Features:
 * - View all offers for a task
 * - Filter and sort offers
 * - Compare offers side-by-side
 * - Accept/reject offers
 * - Message providers
 */

import { useState, useEffect } from 'react';
import { bidService } from '@/services/bid.service';
import { Bid, Task } from '@/types';
import { OfferCard } from './OfferCard';
import { OfferFilters } from './OfferFilters';
import { OfferStats } from './OfferStats';
import { OfferComparison } from './OfferComparison';
import { AcceptOfferModal } from './modals/AcceptOfferModal';
import { RejectOfferModal } from './modals/RejectOfferModal';
import { MessageProviderModal } from './modals/MessageProviderModal';
import { Loader2, AlertCircle } from 'lucide-react';

interface OfferManagementDashboardProps {
  task: Task;
  onOfferAccepted?: (bid: Bid) => void;
  onOfferRejected?: (bid: Bid) => void;
}

type SortOption = 'amount' | '-amount' | 'created_at' | '-created_at' | 'rating' | '-rating';
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export function OfferManagementDashboard({
  task,
  onOfferAccepted,
  onOfferRejected,
}: OfferManagementDashboardProps) {
  // State
  const [offers, setOffers] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('-created_at');
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  
  // Modals
  const [selectedOffer, setSelectedOffer] = useState<Bid | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  // Comparison
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Fetch offers
  useEffect(() => {
    fetchOffers();
  }, [task.id, filterStatus, sortBy, minAmount, maxAmount]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        task: task.id,
        sort_by: sortBy,
      };
      
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      
      if (minAmount !== undefined) {
        filters.min_amount = minAmount;
      }
      
      if (maxAmount !== undefined) {
        filters.max_amount = maxAmount;
      }
      
      const response = await bidService.getTaskBids(task.id);
      
      if (response.success && response.data) {
        setOffers(response.data.results);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // Handle accept offer
  const handleAcceptOffer = (offer: Bid) => {
    setSelectedOffer(offer);
    setShowAcceptModal(true);
  };

  const confirmAcceptOffer = async () => {
    if (!selectedOffer) return;
    
    try {
      const response = await bidService.acceptBid(selectedOffer.id);
      
      if (response.success) {
        setShowAcceptModal(false);
        fetchOffers();
        onOfferAccepted?.(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept offer');
    }
  };

  // Handle reject offer
  const handleRejectOffer = (offer: Bid) => {
    setSelectedOffer(offer);
    setShowRejectModal(true);
  };

  const confirmRejectOffer = async (reason?: string) => {
    if (!selectedOffer) return;
    
    try {
      const response = await bidService.rejectBid(selectedOffer.id, reason);
      
      if (response.success) {
        setShowRejectModal(false);
        fetchOffers();
        onOfferRejected?.(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject offer');
    }
  };

  // Handle message provider
  const handleMessageProvider = (offer: Bid) => {
    setSelectedOffer(offer);
    setShowMessageModal(true);
  };

  // Handle comparison
  const toggleCompareSelection = (offerId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId);
      } else if (prev.length < 3) {
        return [...prev, offerId];
      }
      return prev;
    });
  };

  const getComparedOffers = () => {
    return offers.filter(offer => selectedForComparison.includes(offer.id));
  };

  // Calculate stats
  const pendingOffers = offers.filter(o => o.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Offers for: {task.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingOffers.length} pending offer{pendingOffers.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {pendingOffers.length > 1 && (
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              compareMode
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {compareMode ? 'Exit Compare Mode' : 'Compare Offers'}
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {offers.length > 0 && (
        <OfferStats offers={offers} task={task} />
      )}

      {/* Filters */}
      <OfferFilters
        filterStatus={filterStatus}
        sortBy={sortBy}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onFilterStatusChange={setFilterStatus}
        onSortByChange={setSortBy}
        onMinAmountChange={setMinAmount}
        onMaxAmountChange={setMaxAmount}
        onReset={() => {
          setFilterStatus('all');
          setSortBy('-created_at');
          setMinAmount(undefined);
          setMaxAmount(undefined);
        }}
      />

      {/* Comparison View */}
      {compareMode && selectedForComparison.length > 0 && (
        <OfferComparison
          offers={getComparedOffers()}
          onClose={() => {
            setCompareMode(false);
            setSelectedForComparison([]);
          }}
          onAccept={handleAcceptOffer}
        />
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No offers yet for this task.</p>
          <p className="text-sm text-gray-500 mt-2">
            Offers will appear here once providers submit them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              task={task}
              compareMode={compareMode}
              isSelected={selectedForComparison.includes(offer.id)}
              onToggleSelect={() => toggleCompareSelection(offer.id)}
              onAccept={() => handleAcceptOffer(offer)}
              onReject={() => handleRejectOffer(offer)}
              onMessage={() => handleMessageProvider(offer)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAcceptModal && selectedOffer && (
        <AcceptOfferModal
          offer={selectedOffer}
          task={task}
          onConfirm={confirmAcceptOffer}
          onCancel={() => {
            setShowAcceptModal(false);
            setSelectedOffer(null);
          }}
        />
      )}

      {showRejectModal && selectedOffer && (
        <RejectOfferModal
          offer={selectedOffer}
          onConfirm={confirmRejectOffer}
          onCancel={() => {
            setShowRejectModal(false);
            setSelectedOffer(null);
          }}
        />
      )}

      {showMessageModal && selectedOffer && (
        <MessageProviderModal
          offer={selectedOffer}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedOffer(null);
          }}
        />
      )}
    </div>
  );
}
