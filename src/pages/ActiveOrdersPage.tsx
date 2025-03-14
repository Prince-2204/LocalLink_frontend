import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import DeliveryNavbar from "@/components/DeliveryComp/DeliveryNavbar";
import useIsMobile from "@/lib/hooks/useIsMobile";
import axios from "axios";

// Interface for orders from backend
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

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  far: "bg-yellow-100 text-yellow-800",
  nearby: "bg-accent/20 text-accent",
};

const statusText: Record<string, string> = {
  available: "Order available for pickup",
  far: "Location is far from your current position",
  nearby: "Location is nearby your current position",
};

const ActiveOrdersPage: React.FC = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [distanceFilter, setDistanceFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const getActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/delivery/orders/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(res.data);
      console.log("Orders from backend:", res.data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError("Failed to load available orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getActiveOrders();
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // All orders are considered available for display purposes
  const filteredOrders = orders.filter(order => {
    if (distanceFilter === "all") return true;
    // You can implement distance filtering logic here if needed
    // For now, we're treating all orders as available
    return distanceFilter === "nearby";
  });

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Replace with your actual API endpoint
      const res = await axios.post("http://127.0.0.1:8000/delivery/accept-order/", 
        { order_id: orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(res);
      alert(`Order accepted! This order will now appear in your "Orders Delivered" page.`);
      // Refresh orders after accepting one
      getActiveOrders();
    } catch (error) {
      console.log(error);
      alert("Failed to accept order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DeliveryNavbar />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Available Orders</h1>
          <p className="text-gray-600 mt-1">
            Browse and accept new delivery orders from customers
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setDistanceFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                distanceFilter === "all"
                  ? "bg-accent text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setDistanceFilter("nearby")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                distanceFilter === "nearby"
                  ? "bg-accent text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Nearby
            </button>
            <button
              onClick={() => setDistanceFilter("far")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                distanceFilter === "far"
                  ? "bg-accent text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Far
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
                    <button className="mt-2 text-accent hover:underline" onClick={getActiveOrders}>
                      Try Again
                    </button>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.order_id}>
                      <div
                        onClick={() => handleOrderClick(order.order_id)}
                        className={`p-4 cursor-pointer transition-colors duration-150 ${
                          selectedOrder === order.order_id
                            ? "bg-accent/10"
                            : "hover:bg-gray-50"
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
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.available}`}
                          >
                            Available
                          </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            <svg
                              className="h-3.5 w-3.5 text-gray-400 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-gray-600">
                              From: {order.pickup}
                            </span>
                          </div>
                          <div className="flex items-center text-xs">
                            <svg
                              className="h-3.5 w-3.5 text-gray-400 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                              />
                            </svg>
                            <span className="text-gray-600">
                              To: {order.dropoff}
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
                      {isMobile && selectedOrder === order.order_id
                        ? (() => {
                            const selectedOrderData = orders.find(
                              (o) => o.order_id === selectedOrder
                            );
                            if (!selectedOrderData) return null;

                            return (
                              <div className="flex flex-col p-4 border-t border-gray-200 bg-gray-50">
                                <h1 className="font-medium text-gray-900 mb-2">
                                  Delivery Information
                                </h1>
                                <div className="flex justify-between">
                                  <div>
                                    <h1 className="text-sm font-medium text-gray-700">
                                      Customer
                                    </h1>
                                    <div className="flex gap-2 items-center mt-1">
                                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                          U
                                        </span>
                                      </div>
                                      <div>
                                        <h1 className="text-sm font-medium">
                                          User #{selectedOrderData.user}
                                        </h1>
                                        <p className="text-xs text-gray-600">
                                          Customer
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h1 className="text-sm font-medium text-gray-700">
                                      Delivery Time
                                    </h1>
                                    <div className="mt-1">
                                      <p className="text-sm text-gray-700">
                                        Deadline:{" "}
                                        {new Date(
                                          selectedOrderData.delivery_deadline
                                        ).toLocaleTimeString()}{" "}
                                        on{" "}
                                        {new Date(
                                          selectedOrderData.delivery_deadline
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAcceptOrder(selectedOrderData.order_id)}
                                  className="mt-4 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                                >
                                  Accept Order
                                </button>
                              </div>
                            );
                          })()
                        : null}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No orders match your current filter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details - 3/5 width */}
          {isMobile ? null : (
            <div className="lg:col-span-3">
              {selectedOrder ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                  {(() => {
                    const order = orders.find(
                      (o) => o.order_id === selectedOrder
                    );
                    if (!order) return null;

                    return (
                      <>
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">
                                {order.item_name}
                              </h2>
                              <p className="text-sm text-gray-500 mt-1">
                                Order #{order.order_number}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.available}`}
                            >
                              Available
                            </span>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-gray-700">
                              {statusText.available}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-md font-medium text-gray-900 mb-4">
                            Item Details
                          </h3>
                          <p className="text-sm text-gray-700">
                            {order.item_details}
                          </p>

                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Pickup Location
                              </h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {order.pickup}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Delivery Location
                              </h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {order.dropoff}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-md font-medium text-gray-900 mb-4">
                            Delivery Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Customer
                              </h4>
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    U
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    User #{order.user}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Customer
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Delivery Time
                              </h4>
                              <p className="text-sm text-gray-700">
                                Deadline:{" "}
                                {new Date(
                                  order.delivery_deadline
                                ).toLocaleTimeString()}{" "}
                                on{" "}
                                {new Date(
                                  order.delivery_deadline
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-md font-medium text-gray-900">
                              Payment
                            </h3>
                            <span className="text-md font-bold text-gray-900">
                              ₹{order.budget}
                            </span>
                          </div>

                          <div className="mt-4">
                            <button
                              onClick={() => handleAcceptOrder(order.order_id)}
                              className="w-full py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                            >
                              Accept Order
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No order selected
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select an order from the list to view its details.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveOrdersPage;
