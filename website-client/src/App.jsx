import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import SignatureCakes from "./components/SignatureCakes";
import Testimonials from "./components/Testimonials";
import Contacts from "./components/Contact";
import Footer from "./components/Footer";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader";
import Register from "./components/Register";
import Profile from "./pages/Profile";

function App() {
  const [loading, setLoading] = useState(true);

  // ✅ AOS ni faqat komponent ichida chaqiramiz
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <SignatureCakes />
                  <Testimonials />
                  <Contacts />
                </>
              }
            />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} data-aos="zoom-in" data-aos-delay="400"/>
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <ScrollToTop />
        </>
      )}
    </Router>
  );
}

export default App;