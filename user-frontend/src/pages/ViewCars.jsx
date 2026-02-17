import React from "react";
import ViewCarList from "../components/ViewCarList";

export default function ViewCarPage() {
  return (
    <div className="car-pages-list col-md-12">
      {/* <h1 className="text-2xl font-bold text-center my-6">ADD CARS</h1> */}
      <ViewCarList />
    </div>
  );
}
