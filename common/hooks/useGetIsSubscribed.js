import { useAuth } from "./useAuth";
import { isFutureDate } from "../utils/helpers";

export const useGetIsSubscribed = () => {
  const { clubhouseUser } = useAuth();
  const trialEndsAt = clubhouseUser?.trialEndsAt;
  const activeSubscriptionExists = trialEndsAt ? isFutureDate(trialEndsAt) : false;
  return clubhouseUser?.isSubscribed || activeSubscriptionExists || false;
};
