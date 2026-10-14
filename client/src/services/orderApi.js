import { axiosInstance } from "../axiosCalls/axios.js";

export const validateShippingForm = (values) => {
  const errors = {};

  if (!values.fullName || !values.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!values.phone || !values.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Phone number must be a valid 10-digit number";
  }

  if (!values.addressLine1 || !values.addressLine1.trim()) {
    errors.addressLine1 = "Address line is required";
  }

  if (!values.city || !values.city.trim()) {
    errors.city = "City is required";
  }

  if (!values.state || !values.state.trim()) {
    errors.state = "State is required";
  }

  if (!values.pincode || !values.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createPaymentOrderApi = async (shippingAddress) => {
  const response = await axiosInstance.post("/orders/create-payment-order", {
    shippingAddress,
  });
  return response.data;
};

export const verifyPaymentApi = async (paymentData) => {
  const response = await axiosInstance.post("/orders/verify-payment", paymentData);
  return response.data;
};

export const getMyOrdersApi = async () => {
  const response = await axiosInstance.get("/orders");
  return response.data?.orders || [];
};

export const getOrderByIdApi = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data?.order;
};

export const updateOrderStatusApi = async (id, status) => {
  const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
  return response.data?.order;
};
