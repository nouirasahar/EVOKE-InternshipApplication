import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { VoiceStudio } from "@/components/sections/VoiceStudio";
import { Workflow } from "@/components/sections/Workflow";
import { AgentArchitecture } from "@/components/sections/AgentArchitecture";
import { Features } from "@/components/sections/Features";
import { authRoutes } from "./routes/authRoutes";


function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <VoiceStudio />
        <Workflow />
        <AgentArchitecture />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {authRoutes}
      </Routes>
    </BrowserRouter>
  );
}
