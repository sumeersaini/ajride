// src/layouts/MainLayout.js
import React from 'react';
import Header from './Header';
import MobileBottomBar from './MobileBottomBar';
import useDeviceType from '../hooks/useDeviceType';
import useScrollDirection from '../hooks/useScrollDirection';

export default function MainLayout({ children }) {
  const deviceType = useDeviceType();
  const { scrollDirection, isAtTop } = useScrollDirection();

  const shouldShowBottomBar = scrollDirection === 'down' || isAtTop;

  // console.log("shouldShowBottomBar",shouldShowBottomBar)
  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditional Header */}
      {deviceType === 'mobile' ? (
        //  <div className={`mobile-bottom-bar ${shouldShowBottomBar === false ? 'hide' : ''}`}>
          <div className={`mobile-bottom-bar `}>
         <MobileBottomBar />
       </div>
       
      ) : (
        <Header />
        
      )}

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

    </div>
  );
}
