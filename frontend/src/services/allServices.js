import api from "./api";

export const authService = {
  login: (data) => api.post("/auth/login", data),
  registerCustomer: (data) => api.post("/auth/register/customer", data),
  registerProvider: (data) => api.post("/auth/register/provider", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  logout: (refreshToken) => api.post("/auth/logout", { refresh_token: refreshToken }),
};

export const catalogService = {
  getCategories: () => api.get("/categories"),
  createCategory: (data) => api.post("/categories", data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  getServices: (params) => api.get("/services", { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post("/services", data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
};

export const bookingService = {
  createBooking: (data) => api.post("/bookings", data),
  getBookings: (params) => api.get("/bookings", { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  acceptBooking: (id) => api.patch(`/bookings/${id}/accept`),
  rejectBooking: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),
  assignTechnician: (id, technicianId) => api.post(`/bookings/${id}/assign-technician`, { technician_id: technicianId }),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  uploadImage: (id, imageUrl, imageType) => api.post(`/bookings/${id}/images`, { image_url: imageUrl, image_type: imageType }),
};

export const customerService = {
  getAddresses: () => api.get("/customers/addresses"),
  createAddress: (data) => api.post("/customers/addresses", data),
  updateAddress: (id, data) => api.put(`/customers/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/customers/addresses/${id}`),
  getFavorites: () => api.get("/customers/favorites"),
  toggleFavorite: (providerId) => api.post(`/customers/favorites/${providerId}`),
};

export const providerService = {
  getApprovedProviders: (params) => api.get("/providers", { params }),
  getProviderDetails: (id) => api.get(`/providers/${id}`),
  getMyServices: () => api.get("/providers/me/services"),
  addMyService: (data) => api.post("/providers/me/services", data),
  updateMyService: (id, data) => api.put(`/providers/me/services/${id}`, data),
  deleteMyService: (id) => api.delete(`/providers/me/services/${id}`),
  getMyAvailability: () => api.get("/providers/me/availability"),
  updateMyAvailability: (data) => api.put("/providers/me/availability", data),
  getMyTechnicians: () => api.get("/providers/me/technicians"),
  createTechnician: (data) => api.post("/providers/me/technicians", data),
  getMyEarnings: () => api.get("/providers/me/earnings"),
};

export const technicianService = {
  getAssignedJobs: () => api.get("/technicians/jobs"),
  getJobDetail: (id) => api.get(`/technicians/jobs/${id}`),
  acceptJob: (id) => api.patch(`/technicians/jobs/${id}/accept`),
  arriveJob: (id) => api.patch(`/technicians/jobs/${id}/arrive`),
  completeJob: (id, remarks) => api.patch(`/technicians/jobs/${id}/complete`, { remarks }),
};

export const paymentService = {
  createOrder: (bookingId) => api.post("/payments/create-order", { booking_id: bookingId }),
  verifyPayment: (data) => api.post("/payments/verify", data),
  getHistory: () => api.get("/payments/history"),
  getInvoice: (bookingId) => api.get(`/invoices/${bookingId}`),
};

export const couponService = {
  validateCoupon: (code, orderAmount) => api.post("/coupons/validate", { code, order_amount: orderAmount }),
  getCoupons: () => api.get("/coupons"),
  createCoupon: (data) => api.post("/coupons", data),
};

export const feedbackService = {
  submitReview: (data) => api.post("/reviews", data),
  getProviderReviews: (providerId) => api.get(`/reviews/provider/${providerId}`),
  replyReview: (id, reply) => api.post(`/reviews/${id}/reply`, { reply }),
  submitComplaint: (data) => api.post("/complaints", data),
  getComplaints: () => api.get("/complaints"),
  updateComplaintStatus: (id, data) => api.patch(`/complaints/${id}`, data),
};

export const notificationService = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post("/notifications/read-all"),
};

export const adminService = {
  getStats: () => api.get("/admin/stats"),
  getPendingProviders: () => api.get("/admin/providers/pending"),
  verifyProvider: (id, data) => api.patch(`/admin/providers/${id}/verify`, data),
  getUsers: (params) => api.get("/admin/users", { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getCharts: () => api.get("/analytics/charts"),
  exportBookingsCsv: () => api.get("/admin/reports/bookings-csv", { responseType: "blob" }),
};
