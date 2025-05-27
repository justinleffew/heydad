import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ReferralSystem = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [freeMonths, setFreeMonths] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferMonths, setTransferMonths] = useState(1);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    // Get user's referral code and free months
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code, free_months')
      .eq('id', user.id)
      .single();

    if (profile) {
      setReferralCode(profile.referral_code);
      setFreeMonths(profile.free_months);
    }

    // Get referral history
    const { data: referralHistory, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    if (referralHistory) {
      setReferrals(referralHistory);
    }
  };

  const handleTransferMonths = async (e) => {
    e.preventDefault();
    
    if (transferMonths > freeMonths || transferMonths > 12) {
      alert('Invalid number of months to transfer');
      return;
    }

    // Find user by email
    const { data: recipient, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', transferEmail)
      .single();

    if (!recipient) {
      alert('User not found');
      return;
    }

    // Update both users' free months
    const { error: updateError } = await supabase.rpc('transfer_free_months', {
      sender_id: user.id,
      recipient_id: recipient.id,
      months: transferMonths
    });

    if (updateError) {
      alert('Error transferring months');
      return;
    }

    // Refresh data
    loadReferralData();
    setTransferEmail('');
    setTransferMonths(1);
  };

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Referral System</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Referral Link</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Free Months</h3>
        <p className="text-2xl font-bold text-green-600">{freeMonths} months</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Transfer Free Months</h3>
        <form onSubmit={handleTransferMonths} className="space-y-4">
          <div>
            <label className="block mb-1">Recipient Email</label>
            <input
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Number of Months (max 12)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={transferMonths}
              onChange={(e) => setTransferMonths(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Transfer Months
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Referral History</h3>
        <div className="space-y-2">
          {referrals.map((referral) => (
            <div key={referral.id} className="p-3 bg-gray-50 rounded">
              <p>Referred: {referral.referred_email}</p>
              <p>Date: {new Date(referral.created_at).toLocaleDateString()}</p>
              <p>Status: {referral.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem; 