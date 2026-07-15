"use client";

import { motion } from "motion/react";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./Header";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={whatsappLink(`Hello ${site.name}! I'd like to know more about your products.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-ink/20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <WhatsAppIcon className="h-6 w-6" />
    </motion.a>
  );
}
