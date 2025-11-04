import { useAuth } from '@/contexts/AuthContext';
import { getPlanByProductId, type SubscriptionPlan } from '@/lib/subscriptionPlans';

export const useSubscription = () => {
  const { subscriptionStatus, checkSubscription, isMasterAdmin } = useAuth();

  const isSubscribed = (): boolean => {
    // Master admin sempre tem acesso
    if (isMasterAdmin) return true;
    return subscriptionStatus.subscribed;
  };

  const hasActivePlan = (): boolean => {
    // Master admin sempre tem acesso
    if (isMasterAdmin) return true;
    return subscriptionStatus.subscribed && !!subscriptionStatus.product_id;
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    return getPlanByProductId(subscriptionStatus.product_id);
  };

  const getPlanName = (): string => {
    const plan = getCurrentPlan();
    return plan ? plan.name : 'Sem Plano';
  };

  const getSubscriptionEnd = (): Date | null => {
    if (!subscriptionStatus.subscription_end) return null;
    return new Date(subscriptionStatus.subscription_end);
  };

  const daysUntilRenewal = (): number | null => {
    const endDate = getSubscriptionEnd();
    if (!endDate) return null;
    
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (daysThreshold: number = 7): boolean => {
    const days = daysUntilRenewal();
    return days !== null && days <= daysThreshold && days > 0;
  };

  const isExpired = (): boolean => {
    const days = daysUntilRenewal();
    return days !== null && days <= 0;
  };

  const refresh = async (): Promise<void> => {
    await checkSubscription();
  };

  return {
    subscriptionStatus,
    isSubscribed,
    hasActivePlan,
    getCurrentPlan,
    getPlanName,
    getSubscriptionEnd,
    daysUntilRenewal,
    isExpiringSoon,
    isExpired,
    refresh
  };
};
