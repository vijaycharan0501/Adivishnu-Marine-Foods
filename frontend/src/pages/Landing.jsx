import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const aboutRef = useRef(null);

  const scrollToAbout = (e) => {
    e.preventDefault();
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative bg-[#f4f7fb] overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0 pointer-events-none h-[120vh]">
        <img src="/images/landing_hero_bg.png" alt="Hero Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-[#f4f7fb]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32 relative z-10 min-h-[90vh] flex flex-col justify-center">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg leading-tight">
            Bringing Farmers, Buyers & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-ocean-200">Opportunities Together</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-blue-50 mb-12 leading-relaxed font-medium drop-shadow-md max-w-3xl mx-auto">
            A trusted premium marketplace for seafood trade. Farmers list their catch, admins manage deals, and buyers place bulk orders seamlessly.
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-center gap-6">
            <Link to="/register" className="bg-white text-ocean-700 font-bold text-lg px-8 py-4 rounded-full flex items-center gap-2 transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#about" onClick={scrollToAbout} className="bg-transparent border-2 border-white/80 text-white font-bold text-lg px-8 py-4 rounded-full transform hover:scale-105 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm shadow-lg">
              More Info
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-32 grid md:grid-cols-3 gap-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 text-center hover:bg-white/20 transition-all hover:-translate-y-2">
            <div className="mx-auto bg-gradient-to-br from-white to-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3">
              <Users className="h-8 w-8 text-ocean-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">Direct Trade</h3>
            <p className="text-blue-50 font-medium">Connect directly with verified buyers and farmers in the marine food industry.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 text-center hover:bg-white/20 transition-all hover:-translate-y-2">
            <div className="mx-auto bg-gradient-to-br from-white to-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform rotate-3">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">Secure Contracts</h3>
            <p className="text-blue-50 font-medium">Automated deal confirmations, secure payments, and invoice generation.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 text-center hover:bg-white/20 transition-all hover:-translate-y-2">
            <div className="mx-auto bg-gradient-to-br from-white to-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">Real-time Negotiation</h3>
            <p className="text-blue-50 font-medium">Negotiate prices in real-time with admins to get the best value for your catch.</p>
          </motion.div>
        </motion.div>
      </div>

      {/* About Section */}
      <div ref={aboutRef} id="about" className="bg-[#f4f7fb] py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 mb-20">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">About Adivishnu Marine Foods Pvt. Ltd.</h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                  Adivishnu Marine Foods Pvt. Ltd. is a seafood sourcing, processing, and export company dedicated to delivering high-quality marine products to customers across India and international markets. We focus on quality, food safety, sustainability, and customer satisfaction while maintaining global export standards.
                </p>
              </div>
              <div className="relative h-64 lg:h-auto hidden lg:block">
                <img src="/images/landing_about_bg.png" alt="Premium Seafood" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-24">
            <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Government Licenses</h3>
              <p className="text-slate-600 mb-6 font-medium">We operate with all required government approvals and licenses, including:</p>
              <ul className="space-y-3 text-slate-700 font-medium">
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Import Export Code (IEC)</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> FSSAI License</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> GST Registration</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> MPEDA Registration</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Company Registration Certificate</li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Quality Certifications</h3>
              <p className="text-slate-600 mb-6 font-medium">To ensure food safety and product quality, we follow international standards and certifications such as:</p>
              <ul className="space-y-3 text-slate-700 font-medium">
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> HACCP</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> ISO Standards</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> Food Safety Compliance</li>
                <li className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> Quality Assurance Procedures</li>
              </ul>
            </div>
          </div>

          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-4">Company Gallery</h3>
            <p className="text-center text-slate-600 mb-10 text-lg">Explore our facilities and operations:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/seafood_processing_unit.png" alt="Seafood Processing Unit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                  <h4 className="font-bold text-slate-800">Seafood Processing Unit</h4>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/cold_storage_facility.png" alt="Cold Storage Facility" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                  <h4 className="font-bold text-slate-800">Cold Storage Facility</h4>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/packaging_unit.png" alt="Packaging Unit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                  <h4 className="font-bold text-slate-800">Packaging Unit</h4>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 lg:col-start-1 lg:col-span-1 lg:translate-x-1/2">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/quality_inspection.png" alt="Quality Inspection Area" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                  <h4 className="font-bold text-slate-800">Quality Inspection Area</h4>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 lg:col-start-2 lg:col-span-1 lg:translate-x-1/2">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/export_shipments.png" alt="Export Shipments" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                  <h4 className="font-bold text-slate-800">Export Shipments</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 text-white text-center shadow-xl">
            <h3 className="text-3xl font-bold mb-8">Our Commitment</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <span className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full font-medium">✔ Premium Quality Seafood</span>
              <span className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full font-medium">✔ Food Safety Standards</span>
              <span className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full font-medium">✔ Reliable Export Operations</span>
              <span className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full font-medium">✔ Sustainable Sourcing Practices</span>
              <span className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full font-medium">✔ Customer Satisfaction</span>
            </div>
            <p className="text-xl text-ocean-200 font-semibold italic">Adivishnu Marine Foods Pvt. Ltd. – Delivering Quality Seafood to Global Markets.</p>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-ocean-300/20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Landing;
