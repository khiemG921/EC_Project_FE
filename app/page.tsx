"use client"
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import ServiceCatalog from '@/components/ServiceCatalog';
import HowItWorks from '@/components/HowItWorks';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import { Service, fetchServices } from '@/lib/servicesApi';

// MAIN APP COMPONENT
export default function App() {
  const [services, setServices] = useState<Service[]>([]);

  // Lấy dữ liệu dịch vụ từ API
  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  return (
    <div className="bg-white font-sans">
      <Header />

      <main>
        <HeroSection />
        <ServiceCatalog services={services} />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
