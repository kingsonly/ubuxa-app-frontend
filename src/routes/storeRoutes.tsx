import React from "react";
import { Routes, Route } from "react-router-dom";
import Store from "../Pages/Store";
import CreateNewStore from "../Components/Store/CreateNewStore";
import StoreDetailModal from "../Components/Store/StoreDetailModal";
// import WarehouseHistory from "../Components/WareHouses/WarehouseHistory";

const StoreRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Store />} />
      <Route path="/create" element={<CreateNewStore />} />
      <Route path="/:id" element={<StoreDetailModal />} />
      {/* <Route path="/:id/inventory-log" element={<WarehouseHistory />} /> */}
    </Routes>
  );
};

export default StoreRoutes; 