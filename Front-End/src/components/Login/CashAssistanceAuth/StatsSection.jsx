import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Users, DollarSign, Shield, BarChart3 } from "lucide-react";

const StatsSection = () => {
  const statsData = [
    { 
      icon: Users, 
      value: 10000, 
      title: "Beneficiaries Served", 
      color: "from-blue-500 to-blue-700",
      suffix: "+"
    },
    { 
      icon: DollarSign, 
      value: 50, 
      title: "Funds Distributed", 
      color: "from-emerald-500 to-emerald-700",
      prefix: "₱",
      suffix: "M+"
    },
    { 
      icon: Shield, 
      value: 99.9, 
      title: "Secure Transactions", 
      color: "from-purple-500 to-purple-700",
      suffix: "%"
    },
    { 
      icon: BarChart3, 
      value: 8, 
      title: "Municipalities Covered", 
      color: "from-amber-500 to-amber-700" 
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-white via-orange-50 to-orange-100 rounded-2xl mx-auto max-w-6xl shadow-2xl overflow-hidden relative">
      {/* Orange accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-orange-400/10 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader 
          title="Program Impact" 
          description="Making a difference in Biliran communities through transparent assistance"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const SectionHeader = ({ title, description }) => (
  <motion.div
    className="text-center mb-10"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">{description}</p>
  </motion.div>
);

// Easing function para sa smooth animation
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const updateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const newValue = easedProgress * stat.value;
        
        setCount(newValue);
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(stat.value);
        }
      };
      
      requestAnimationFrame(updateCount);
    }
  }, [isInView, stat.value]);

  // Format the number with commas
  const formatNumber = (num) => {
    if (stat.value % 1 === 0) {
      return Math.round(num).toLocaleString();
    } else {
      return num.toFixed(1);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-orange-100 shadow-md hover:shadow-xl transition-all duration-300 group hover:border-orange-200"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, backgroundColor: "rgba(255, 247, 237, 0.95)" }}
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4 shadow-inner group-hover:shadow-lg transition-shadow duration-300`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      
      <h3 className="text-3xl font-bold text-gray-800 mb-1 min-h-[3rem] flex items-center">
        {stat.prefix}
        <motion.span
          key={count}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatNumber(count)}
        </motion.span>
        {stat.suffix}
      </h3>
      
      <p className="text-gray-500 text-sm md:text-base font-semibold uppercase tracking-wide">
        {stat.title}
      </p>
    </motion.div>
  );
};

export default StatsSection;