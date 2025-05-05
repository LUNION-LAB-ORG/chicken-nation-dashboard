"use client";

import React, { useState } from "react";

import { OrdersTable, Order } from "./OrdersTable";
import OrderHeader from "./OrderHeader";
import { MenuItem } from "@/types";
import AddMenu from "../Menus/AddMenu";
import OrderDetails from "./OrderDetails";
import { toast } from "react-hot-toast";

interface OrderState {
  view: "list" | "create" | "edit" | "view";
  selectedMenu?: MenuItem;
  selectedOrder?: Order;
}

export default function Orders() {
  const [orderState, setOrderState] = useState<OrderState>({
    view: "list",
  });

  const handleViewChange = (
    view: "list" | "create" | "edit" | "view",
    menu?: MenuItem
  ) => {
    setOrderState({ view, selectedMenu: menu });
  };

  const handleViewOrderDetails = (order: Order) => {
    setOrderState({ view: "view", selectedOrder: order });
  };

  const handleAcceptOrder = (orderId: string) => {
    if (orderState.selectedOrder && orderState.selectedOrder.id === orderId) {
      const updatedOrder = { ...orderState.selectedOrder, status: "EN COURS" };

      toast.success(`Commande ${orderId} acceptée`);
      setOrderState({ view: "list" });
    }
  };

  const handleRejectOrder = (orderId: string) => {
    if (orderState.selectedOrder && orderState.selectedOrder.id === orderId) {
      const updatedOrder = { ...orderState.selectedOrder, status: "ANNULÉE" };

      toast.success(`Commande ${orderId} refusée`);
      setOrderState({ view: "list" });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-2 lg:pt-2 pb-2 sm:px-4 sm:pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
        <OrderHeader
          currentView={orderState.view}
          onBack={() => handleViewChange("list")}
          onCreateMenu={() => handleViewChange("create")}
        />

        {orderState.view === "list" && (
          <div>
            <OrdersTable onViewDetails={handleViewOrderDetails} />
          </div>
        )}

        {orderState.view === "view" && orderState.selectedOrder && (
          <OrderDetails
            order={orderState.selectedOrder}
            onBack={() => handleViewChange("list")}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
          />
        )}

        {orderState.view === "create" && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:w-2/3">
              <AddMenu />
            </div>
            <div className="w-full lg:w-1/3 invisible">
              {/* Espace vide comme dans Menus */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
