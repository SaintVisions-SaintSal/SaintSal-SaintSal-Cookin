"use client";

import * as motion from "motion/react-client";

export default function CompanyMarquee() {
  const companies = ['GraceFlow', 'FaithNexa', 'MinistryAI', 'SpiritualTech', 'DivineTech', 'SacredAI', 'FaithFlow', 'MinistryCore'];

  return (
    <div className="relative overflow-hidden">
      {/* Fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
      
      {/* Marquee container */}
      <div className="flex animate-marquee">
        {/* First set of companies */}
        <div className="flex items-center gap-12 whitespace-nowrap">
          {companies.map((company, index) => (
            <motion.div
              key={`first-${index}`}
              className="text-gray-500 font-medium text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {company}
            </motion.div>
          ))}
        </div>
        
        {/* Second set of companies for seamless loop */}
        <div className="flex items-center gap-12 whitespace-nowrap ml-12">
          {companies.map((company, index) => (
            <motion.div
              key={`second-${index}`}
              className="text-gray-500 font-medium text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
