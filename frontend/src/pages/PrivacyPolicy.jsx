import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '../utils/motion';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect the following types of information when you use our website or services:

a) Personal Information:
• Full name and email address (collected during registration)
• Mobile/phone number (collected during order placement)
• Shipping and billing address
• Order history and transaction details

b) Health-Related Information:
• Prescription uploads (for prescription medicines only)
• Medical queries submitted to our pharmacist support

c) Technical Information:
• IP address and browser type
• Pages visited and time spent on site
• Device information and operating system
• Cookies and usage data`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information collected for the following purposes:

• To process and fulfill your medicine orders
• To send OTP verification for secure login
• To communicate order updates, shipping status, and delivery notifications
• To provide customer support and respond to queries
• To verify prescriptions for Schedule H/H1 drugs
• To improve our website and services
• To comply with legal obligations under the Drugs and Cosmetics Act, 1940
• To prevent fraud and ensure platform security
• To send promotional offers (only with your consent)`
  },
  {
    title: '3. Prescription Data',
    content: `Agoc Care Pvt. Ltd. handles prescription data with utmost care:

• Prescriptions are collected solely to verify eligibility for Schedule H medicines
• Prescription images are stored securely and not shared with third parties
• Prescriptions are retained only as long as required by applicable pharmacy laws
• Our licensed pharmacists review prescriptions in compliance with the Drugs and Cosmetics Act, 1940 and Pharmacy Act, 1948
• You may request deletion of your prescription data by contacting us`
  },
  {
    title: '4. Sharing of Information',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:

• Delivery Partners: Shipping address and contact number shared with courier partners for order delivery
• Payment Gateway: Order amount and basic details shared with Razorpay for secure payment processing
• Legal Compliance: Information disclosed to government/regulatory authorities when required by law
• Business Transfer: In case of merger or acquisition, your data may be transferred to the new entity under the same privacy terms

All third-party partners are contractually bound to maintain confidentiality of your data.`
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures to protect your information:

• All data transmission is encrypted using SSL/TLS (HTTPS)
• Passwords are stored using bcrypt hashing (one-way encryption)
• OTP-based authentication eliminates password-related security risks
• Regular security audits and vulnerability assessments
• Access to personal data is restricted to authorized personnel only
• Payment information is processed directly by Razorpay (PCI DSS compliant) — we do not store card details`
  },
  {
    title: '6. Cookies',
    content: `Our website uses cookies to enhance your experience:

• Session Cookies: Used for maintaining your login session
• Functional Cookies: Remember your cart items and preferences
• Analytics Cookies: Help us understand how users interact with our site

You may disable cookies in your browser settings, but this may affect the functionality of certain features. We do not use cookies for targeted advertising.`
  },
  {
    title: '7. Your Rights',
    content: `As a user of Agoc Care, you have the following rights:

• Right to Access: Request a copy of your personal data we hold
• Right to Correction: Update or correct inaccurate personal information
• Right to Deletion: Request deletion of your account and associated data
• Right to Withdraw Consent: Opt out of promotional communications at any time
• Right to Data Portability: Receive your data in a structured, machine-readable format

To exercise any of these rights, contact us at: agoccarepvtltd@gmail.com`
  },
  {
    title: '8. Data Retention',
    content: `We retain your personal data for the following periods:

• Account Information: As long as your account is active
• Order Records: 7 years (as required by GST and accounting laws)
• Prescription Records: As per applicable pharmacy regulations
• Communication Logs: 1 year
• Upon account deletion, personal data is anonymized or deleted within 30 days, except where retention is required by law`
  },
  {
    title: '9. Children\'s Privacy',
    content: `Agoc Care services are not directed to children under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, please contact us immediately and we will delete such information promptly.`
  },
  {
    title: '10. Third-Party Links',
    content: `Our website may contain links to third-party websites (payment gateways, social media platforms, etc.). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.`
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of significant changes by:
• Posting a notice on our website
• Sending an email to your registered email address

The "Last Updated" date at the top of this policy will always indicate when it was last revised. Continued use of our services after changes constitutes acceptance of the updated policy.`
  },
  {
    title: '12. Grievance Officer',
    content: `In accordance with the Information Technology Act, 2000 and the IT (Intermediary Guidelines) Rules, 2011, we have appointed a Grievance Officer:

Name: Satyajeet Kadavekar
Designation: CEO & Founder
Company: Agoc Care Private Limited
Address: Palladium Building, Near Pristine Womens Hospital, Assembly Road, Shahupuri, Kolhapur, Maharashtra
Email: agoccarepvtltd@gmail.com
Phone: +91 99232 68310
Support Hours: Mon–Sat, 9:00 AM – 7:00 PM

Any grievance or complaint regarding privacy will be addressed within 30 days of receipt.`
  },
  {
    title: '13. Contact Us',
    content: `For any questions, concerns, or requests regarding this Privacy Policy, please contact us:

Agoc Care Private Limited
Palladium Building, Near Pristine Womens Hospital,
Assembly Road, Shahupuri, Kolhapur, Maharashtra – 416001

Email: agoccarepvtltd@gmail.com
Phone: +91 99232 68310
WhatsApp: +91 91589 90002
Support Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST`
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Agoc Care</title>
        <meta name="description" content="Privacy Policy of Agoc Care Private Limited — how we collect, use, and protect your personal information." />
      </Helmet>

      <div className="bg-teal-light min-h-screen">
        {/* Header */}
        <section className="bg-primary py-14 px-4 text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
            <motion.p variants={fadeUp} className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              Legal
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 text-sm">
              Last Updated: May 2026 &nbsp;|&nbsp; Agoc Care Private Limited
            </motion.p>
          </motion.div>
        </section>

        {/* Intro */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 mb-8">
            <p className="text-teal text-sm leading-relaxed">
              Agoc Care Private Limited ("we", "our", or "us") is committed to protecting your privacy and personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
              website <strong>agoccarepvtltd.com</strong> or use our services. Please read this policy carefully.
              By using our platform, you consent to the practices described herein.
            </p>
          </motion.div>

          {/* Sections */}
          <motion.div className="space-y-6"
            variants={staggerContainer(0.06)} initial="hidden" whileInView="visible" viewport={viewport}>
            {SECTIONS.map((s, i) => (
              <motion.div key={i} variants={staggerItem}
                className="bg-white rounded-2xl border border-teal-mid/30 shadow-card overflow-hidden">
                <div className="bg-primary/5 border-b border-teal-mid/20 px-6 py-4">
                  <h2 className="text-base font-extrabold text-primary">{s.title}</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer note */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            className="mt-8 text-center text-xs text-gray-400 pb-8">
            <p>This Privacy Policy is governed by the laws of India including the Information Technology Act, 2000,</p>
            <p>IT (Amendment) Act 2008, and the Drugs & Cosmetics Act, 1940.</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Link to="/" className="text-primary hover:underline font-semibold">Home</Link>
              <span>·</span>
              <Link to="/about" className="text-primary hover:underline font-semibold">About Us</Link>
              <span>·</span>
              <Link to="/medicines" className="text-primary hover:underline font-semibold">Products</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
