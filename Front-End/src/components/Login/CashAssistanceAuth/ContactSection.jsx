import { motion } from "framer-motion";
import { Contact, Phone, Mail, MapPin, Globe, Clock, Shield, MessageSquare } from "lucide-react";

const ContactSection = () => {
    const contactInfo = [
        {
            icon: Phone,
            title: "Phone Support",
            info: "(053) 123-4567",
            description: "Available Monday to Friday, 8AM to 5PM",
            color: "from-emerald-500 to-emerald-700"
        },
        {
            icon: Mail,
            title: "Email",
            info: "cash.assistance@biliran.gov.ph",
            description: "Response within 24-48 hours",
            color: "from-blue-500 to-blue-700"
        },
        {
            icon: MapPin,
            title: "Main Office",
            info: "Provincial Capitol, Naval, Biliran",
            description: "Visit by appointment only",
            color: "from-purple-500 to-purple-700"
        },
        {
            icon: Globe,
            title: "Website",
            info: "www.biliran.gov.ph",
            description: "Official provincial government portal",
            color: "from-amber-500 to-amber-700"
        }
    ];

    const municipalOffices = [
        { municipality: "Naval (Capital)", contact: "(053) 123-4567", email: "naval.assistance@biliran.gov.ph" },
        { municipality: "Almeria", contact: "(053) 234-5678", email: "almeria.assistance@biliran.gov.ph" },
        { municipality: "Biliran", contact: "(053) 345-6789", email: "biliran.mun@biliran.gov.ph" },
        { municipality: "Caibiran", contact: "(053) 456-7890", email: "caibiran.assistance@biliran.gov.ph" }
    ];

    const emergencyContacts = [
        { service: "Technical Support", available: "24/7", contact: "support@biliran.gov.ph" },
        { service: "Beneficiary Assistance", available: "Mon-Fri, 8AM-5PM", contact: "assistance@biliran.gov.ph" },
        { service: "Security Concerns", available: "24/7", contact: "security@biliran.gov.ph" },
        { service: "Media Inquiries", available: "Mon-Fri, 9AM-4PM", contact: "media@biliran.gov.ph" }
    ];

    return (
        <section id="contact" className="relative py-20 overflow-hidden">
            <div className="container relative z-10 mx-auto px-12 sm:px-16 lg:px-24">
                {/* Modern Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-300 animate-pulse"></div>
                        <span className="text-sm font-medium bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent tracking-wide">
                            GET IN TOUCH
                        </span>
                    </div>
                    
                    <h2 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        <span className="inline-block bg-gradient-to-r from-white via-orange-50 to-orange-100 bg-clip-text text-transparent">
                            Contact Us
                        </span>
                    </h2>
                    
                    <p className="mx-auto max-w-2xl text-lg sm:text-xl font-light leading-relaxed bg-gradient-to-r from-white via-orange-50 to-white bg-clip-text text-transparent">
                        <span className="text-orange-300 font-medium">Provincial Government of Biliran</span> - Cash Assistance Program
                    </p>
                </div>

                {/* Modern Section Divider */}
                <div className="mb-12 flex items-center justify-center gap-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 animate-pulse"></div>
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent tracking-tight">Primary Contacts</h3>
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-300 animate-pulse"></div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
                </div>

                {/* Contact Cards - Modern Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
                    {contactInfo.map((contact, index) => (
                        <ModernContactCard key={index} contact={contact} index={index} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <ModernMunicipalOffices offices={municipalOffices} />
                    <ModernEmergencyContacts contacts={emergencyContacts} />
                </div>

                {/* Additional Info Section */}
                <motion.div
                    className="mt-16 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="grid md:grid-cols-3 gap-8">
                        <InfoCard 
                            icon={Clock}
                            title="Office Hours"
                            description="Monday to Friday: 8:00 AM - 5:00 PM"
                            note="Closed on weekends and holidays"
                            color="from-blue-500 to-cyan-500"
                        />
                        <InfoCard 
                            icon={Shield}
                            title="Security"
                            description="All communications are encrypted and secure"
                            note="256-bit SSL encryption"
                            color="from-emerald-500 to-green-500"
                        />
                        <InfoCard 
                            icon={MessageSquare}
                            title="Response Time"
                            description="Email: 24-48 hours"
                            note="Phone: Immediate during office hours"
                            color="from-purple-500 to-pink-500"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Modern Contact Card Component
const ModernContactCard = ({ contact, index }) => {
    const Icon = contact.icon;
    
    return (
        <motion.div
            className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            {/* Glassmorphic Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-700 group-hover:border-orange-300/30 group-hover:shadow-2xl group-hover:shadow-orange-500/20"></div>
            
            {/* Dynamic Gradient Overlay on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-orange-500/10 via-orange-400/10 to-orange-300/10 rounded-3xl"></div>

            {/* Content */}
            <div className="relative p-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${contact.color} mb-4 backdrop-blur-sm border border-white/20`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-orange-50 mb-2">{contact.title}</h3>
                <p className="text-lg text-orange-300 font-semibold mb-2">{contact.info}</p>
                <p className="text-orange-100/90 text-sm">{contact.description}</p>
                
                {/* Hover Indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                </div>
            </div>
        </motion.div>
    );
};

// Modern Municipal Offices Component
const ModernMunicipalOffices = ({ offices }) => (
    <motion.div
        className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-700"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        {/* Glassmorphic Card Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 animate-pulse"></div>
                <h3 className="text-2xl font-bold text-orange-50">Municipal Offices</h3>
            </div>
            <div className="space-y-4">
                {offices.map((office, idx) => (
                    <ModernOfficeItem key={idx} office={office} />
                ))}
            </div>
        </div>
    </motion.div>
);

const ModernOfficeItem = ({ office }) => (
    <div className="group/item flex justify-between items-center p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 transition-all duration-300 border border-transparent hover:border-orange-300/30">
        <div>
            <h4 className="text-orange-50 font-semibold group-hover/item:text-orange-300 transition-colors duration-300">
                {office.municipality}
            </h4>
            <p className="text-orange-200/70 text-sm">{office.email}</p>
        </div>
        <div className="text-right">
            <p className="text-orange-300 font-semibold">{office.contact}</p>
            <div className="text-xs text-orange-300/50 mt-1">Direct Line</div>
        </div>
    </div>
);

// Modern Emergency Contacts Component
const ModernEmergencyContacts = ({ contacts }) => (
    <motion.div
        className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-700"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        {/* Glassmorphic Card Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-pulse"></div>
                <h3 className="text-2xl font-bold text-orange-50">Emergency Contacts</h3>
            </div>
            <div className="space-y-4">
                {contacts.map((emergency, idx) => (
                    <ModernEmergencyItem key={idx} emergency={emergency} />
                ))}
            </div>
        </div>
    </motion.div>
);

const ModernEmergencyItem = ({ emergency }) => (
    <div className="group/item flex justify-between items-center p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 transition-all duration-300 border border-transparent hover:border-orange-300/30">
        <div>
            <h4 className="text-orange-50 font-semibold group-hover/item:text-orange-300 transition-colors duration-300">
                {emergency.service}
            </h4>
            <div className="flex items-center gap-2 text-orange-200/70 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                Available: {emergency.available}
            </div>
        </div>
        <div className="text-right">
            <p className="text-orange-300 font-semibold text-sm">{emergency.contact}</p>
            <div className="text-xs text-orange-300/50 mt-1">Email Contact</div>
        </div>
    </div>
);

// Additional Info Card Component
const InfoCard = ({ icon: Icon, title, description, note, color }) => (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 hover:border-orange-300/30 transition-all duration-300">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} mb-4 backdrop-blur-sm`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-orange-50 mb-2">{title}</h3>
        <p className="text-orange-100/90 mb-2">{description}</p>
        <p className="text-sm text-orange-200/70">{note}</p>
        
        {/* Hover Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
        </div>
    </div>
);

export default ContactSection;