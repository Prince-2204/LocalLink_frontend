import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import DeliveryNavbar from "@/components/DeliveryComp/DeliveryNavbar";
import axios from "axios";

// Interface for backend order data
interface Order {
  order_number: number;
  order_id: string;
  item_name: string;
  item_details: string;
  pickup: string;
  dropoff: string;
  delivery_deadline: string;
  budget: number;
  status: string;
  user: number;
}

// Star rating component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-accent" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
};

const statusColors: Record<string, string> = {
  "Delivered": "bg-green-100 text-green-800",
  "In Transit": "bg-accent/20 text-accent",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Cancelled": "bg-red-100 text-red-800"
};

const OrdersDeliveredPage: React.FC = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8000/delivery/orders/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(res.data);
        console.log("Orders from backend:", res.data);
      } catch (error) {
        console.log(error);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const currentDate = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  const filteredOrders = (() => {
    // First apply status filter if not "all"
    let filtered = orders;
    if (statusFilter !== "all") {
      filtered = orders.filter(order => order.status === statusFilter);
    }
    
    // Then apply time filter
    if (timeFilter === "week") {
      return filtered.filter(order => new Date(order.delivery_deadline) >= oneWeekAgo);
    }
    if (timeFilter === "month") {
      return filtered.filter(order => new Date(order.delivery_deadline) >= oneMonthAgo);
    }
    
    return filtered;
  })();

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DeliveryNavbar />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Manage your orders</p>

          {/* Status filter buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === "all" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Orders
            </button>
            <button 
              onClick={() => setStatusFilter("Delivered")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === "Delivered" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Delivered
            </button>
            <button 
              onClick={() => setStatusFilter("Pending")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === "Pending" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pending
            </button>
          </div>

          {/* Time filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => setTimeFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeFilter === "all" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Time
            </button>
            <button 
              onClick={() => setTimeFilter("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeFilter === "month" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Past Month
            </button>
            <button 
              onClick={() => setTimeFilter("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeFilter === "week" 
                  ? "bg-accent text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Past Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Orders List - 2/5 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-6 text-center">
                    <svg className="animate-spin h-8 w-8 text-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <button className="mt-2 text-accent hover:underline" onClick={() => window.location.reload()}>
                      Try Again
                    </button>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div 
                      key={order.order_id}
                      onClick={() => handleOrderClick(order.order_id)}
                      className={`p-4 cursor-pointer transition-colors duration-150 ${
                        selectedOrder === order.order_id ? "bg-accent/10" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {order.item_name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                            {order.item_details}
                          </p>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center text-xs">
                          <svg className="h-3.5 w-3.5 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">
                            Deadline: {new Date(order.delivery_deadline).toLocaleDateString()} {new Date(order.delivery_deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Order #{order.order_number}
                        </div>
                        <div className="text-sm font-medium">
                          ₹{order.budget}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No orders match your current filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details - 3/5 width */}
          <div className="lg:col-span-3">
            {selectedOrder ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                {(() => {
                  const order = orders.find(o => o.order_id === selectedOrder);
                  if (!order) return null;
                  
                  return (
                    <>
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{order.item_name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Order #{order.order_number}</p>
                          </div>
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[order.status] || "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-4">Order Details</h3>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Pickup Location</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{order.pickup}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Location</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{order.dropoff}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Delivery Deadline</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(order.delivery_deadline).toLocaleDateString()} at {new Date(order.delivery_deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Budget</p>
                            <p className="text-sm font-medium text-gray-900">
                              ₹{order.budget}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-4">Item Details</h3>
                        <p className="text-sm text-gray-700 mb-4">
                          {order.item_details}
                        </p>
                      </div>
                      
                      <div className="p-6">
                        <div className="mt-6 flex justify-between items-center">
                          <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Contact Support
                          </button>
                          <span className="text-md font-bold text-gray-900">₹{order.budget}</span>
                        </div>
                        
                        {order.status === "Pending" && (
                          <button className="w-full mt-4 py-3 px-4 bg-accent text-white rounded-md shadow-sm text-sm font-medium hover:bg-accent/90">
                            Accept Order
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No order selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an order from the list to view its details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDeliveredPage;