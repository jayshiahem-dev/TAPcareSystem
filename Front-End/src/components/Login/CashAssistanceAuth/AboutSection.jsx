import { motion } from "framer-motion";
import { Info, HeartHandshake, Award, Shield, Mountain, Waves, Leaf, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import image1 from "../../../assets/image1.jpg";
import image2 from "../../../assets/image2.jpg";
import image3 from "../../../assets/image3.jpg";
import image4 from "../../../assets/image4.jpg";
import image5 from "../../../assets/image6.jpg"; // Note: Check if you intended image6 here
import image6 from "../../../assets/image6.jpg";
import image7 from "../../../assets/image7.jpg";

const AboutSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [hoveredSlide, setHoveredSlide] = useState(null);
    const galleryRef = useRef(null);
    const autoPlayTimerRef = useRef(null);
    
    const coreValues = [
        {
            icon: HeartHandshake,
            title: "Our Mission",
            description: "To provide timely and efficient financial assistance to qualified beneficiaries across Biliran Province through a secure and transparent distribution system.",
            color: "from-emerald-500 to-emerald-700"
        },
        {
            icon: Award,
            title: "Our Vision",
            description: "To be Biliran's most trusted and effective assistance program that empowers communities and fosters economic stability throughout the province.",
            color: "from-blue-500 to-blue-700"
        },
        {
            icon: Shield,
            title: "Our Values",
            description: "Integrity, transparency, accountability, and compassion guide every aspect of our operations in serving Biliran communities.",
            color: "from-purple-500 to-purple-700"
        }
    ];

    const biliranFeatures = [
        {
            icon: Mountain,
            title: "Provincial Coverage",
            description: "Serving all municipalities of Biliran with equal access and distribution.",
            color: "from-green-500 to-green-700"
        },
        {
            icon: Waves,
            title: "Island-wide Service",
            description: "Reaching even the most remote coastal and island communities.",
            color: "from-blue-500 to-blue-700"
        },
        {
            icon: Leaf,
            title: "Sustainable Support",
            description: "Long-term assistance programs for sustainable community development.",
            color: "from-emerald-500 to-emerald-700"
        }
    ];

    const municipalities = [
        "Almeria", "Biliran", "Cabucgayan", "Caibiran",
        "Culaba", "Kawayan", "Maripipi", "Naval"
    ];

    const galleryImages = [
        { id: 1, image: image1, title: "Community Assistance Distribution", description: "On-site financial assistance distribution in remote communities", category: "Distribution" },
        { id: 2, image: image2, title: "Beneficiary Registration", description: "Efficient registration process for qualified beneficiaries", category: "Registration" },
        { id: 3, image: image3, title: "Team Coordination", description: "Our team preparing for province-wide distribution", category: "Team" },
        { id: 4, image: image4, title: "Municipal Outreach", description: "Bringing services directly to municipal centers", category: "Outreach" },
        { id: 5, image: image5, title: "Technology Integration", description: "Using modern systems for transparent transactions", category: "Technology" },
        { id: 6, image: image6, title: "Community Engagement", description: "Regular community meetings and consultations", category: "Engagement" },
        { id: 7, image: image7, title: "Provincial Support", description: "Supporting development initiatives across Biliran", category: "Support" }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    const toggleAutoPlay = () => setIsAutoPlaying(prev => !prev);

    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayTimerRef.current = setInterval(nextSlide, 5000);
        } else {
            clearInterval(autoPlayTimerRef.current);
        }
        return () => clearInterval(autoPlayTimerRef.current);
    }, [isAutoPlaying]);

    const handleMouseEnter = () => isAutoPlaying && clearInterval(autoPlayTimerRef.current);
    const handleMouseLeave = () => isAutoPlaying && (autoPlayTimerRef.current = setInterval(nextSlide, 5000));

    return (
        <section id="about" className="relative z-10 py-20 overflow-hidden">
            <div className="container relative z-10 mx-auto px-6 sm:px-16 lg:px-24">
                {/* Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 animate-pulse"></div>
                        <span className="text-sm font-medium text-white tracking-wide">ABOUT PROGRAM</span>
                    </div>
                    <h2 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black text-white">About Our Program</h2>
                    <p className="mx-auto max-w-2xl text-lg text-orange-50/80">
                        Supporting the people of <span className="text-orange-300 font-medium">Biliran Province</span> through transparent assistance distribution
                    </p>
                </div>

                {/* Values Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coreValues.map((value, index) => (
                        <ModernValueCard key={index} value={value} index={index} />
                    ))}
                </div>

                {/* Gallery */}
                <motion.div className="mt-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">Program in Action</h3>
                    </div>

                    <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        {/* Gallery Controls */}
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white">Photo Gallery</h4>
                            <div className="flex gap-2">
                                <button onClick={toggleAutoPlay} className="p-2 rounded-xl bg-white/10 text-orange-300 border border-white/10">
                                    {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <button onClick={prevSlide} className="p-2 rounded-xl bg-white/10 text-orange-300 border border-white/10"><ChevronLeft size={20} /></button>
                                <button onClick={nextSlide} className="p-2 rounded-xl bg-white/10 text-orange-300 border border-white/10"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        {/* Main Slide */}
                        <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/10">
                            {galleryImages.map((img, idx) => (
                                idx === currentSlide && (
                                    <motion.div key={img.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                                        <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                                            <span className="text-orange-400 text-sm font-bold uppercase">{img.category}</span>
                                            <h5 className="text-2xl font-bold text-white">{img.title}</h5>
                                            <p className="text-white/70">{img.description}</p>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* History & Coverage */}
                <ModernHistoryAndCoverage municipalities={municipalities} />

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {biliranFeatures.map((feature, index) => (
                        <ModernFeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const ModernValueCard = ({ value, index }) => {
    const Icon = value.icon;
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }}
            className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all group"
        >
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.color} mb-6`}>
                <Icon className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
            <p className="text-white/60">{value.description}</p>
        </motion.div>
    );
};

const ModernHistoryAndCoverage = ({ municipalities }) => (
    <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10">
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <h3 className="text-2xl font-bold text-white mb-6">Program History</h3>
                <p className="text-white/60 mb-4">Established in 2015, we've grown from a small-scale initiative to a province-wide support system.</p>
                <p className="text-white/60">Using technology, we ensure every centavo reaches the right hands with total transparency.</p>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-6">Coverage Area</h3>
                <div className="grid grid-cols-2 gap-4">
                    {municipalities.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/70 hover:text-orange-300 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span>{m}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ModernFeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            className="p-6 rounded-3xl bg-white/5 border border-white/10"
        >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                <Icon className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-white/60 text-sm">{feature.description}</p>
        </motion.div>
    );
};

export default AboutSection;