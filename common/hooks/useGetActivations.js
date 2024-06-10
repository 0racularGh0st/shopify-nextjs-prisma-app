"use client";
import { useState } from "react";
import { handleResponse } from "@/common/utils/network/responseHandler";
import { convertObjectFieldNamesToCamelCase } from "@/common/utils/helpers";
import { activationsUrl } from "@/common/utils/network/endpoints";
import { useAuth } from "@/common/hooks/useAuth";

export const useGetActivations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activations, setActivations] = useState([]);
  const { setClubhouseUser } = useAuth();
  const getActivations = async (token) => {
    setIsLoading(true);
    const res = await fetch(activationsUrl, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const {
        code, response,
      } = await handleResponse(res);
      const bookings = response;
      if (code === 200 && bookings) {
        setIsLoading(false);
        console.log({ bookings });
        const allowedBookings = bookings?.data?.data.filter((booking) => booking?.status === 'Paid' && booking.state !== 'completed');
        console.log({ allowedBookings });
        const allowedBookingsTransformed = convertObjectFieldNamesToCamelCase(allowedBookings);
        setActivations(allowedBookingsTransformed);
        return allowedBookingsTransformed;
      } 
      if (code === 401) {
        setClubhouseUser('{}');
      }
      setIsLoading(false);
      return null
  };

  return {
    getActivations,
    isLoading,
    activations,
  }
}