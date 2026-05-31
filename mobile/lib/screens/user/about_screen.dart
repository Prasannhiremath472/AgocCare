import 'package:flutter/material.dart';
import '../../core/theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('About AgocCare')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(
            child: Column(children: [
              Container(
                width: 90, height: 90,
                decoration: BoxDecoration(
                  gradient: AppGradients.heroGradient,
                  borderRadius: BorderRadius.circular(22),
                ),
                child: const Center(
                  child: Text('AC', style: TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 12),
              const Text('AgocCare', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              const Text('Your trusted health partner', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
              const SizedBox(height: 4),
              const Text('Version 1.0.0', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            ]),
          ),
          const SizedBox(height: 28),
          _Section(
            title: 'About Us',
            content: 'AgocCare is a trusted online pharmacy and healthcare platform committed to making quality medicines and health products accessible to everyone. We believe healthcare should be simple, affordable, and delivered right to your doorstep.',
          ),
          const SizedBox(height: 16),
          _Section(
            title: 'Our Mission',
            content: 'To bridge the gap between patients and quality healthcare by providing a reliable, AI-powered platform for ordering medicines, uploading prescriptions, and accessing healthcare services.',
          ),
          const SizedBox(height: 16),
          const Text('What We Offer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          ...[
            ('Genuine Medicines', 'All products sourced from verified manufacturers', Icons.verified_rounded),
            ('AI Prescription Scanner', 'Upload your prescription and let AI find your medicines', Icons.document_scanner_rounded),
            ('Fast Delivery', 'Free delivery on orders above ₹499', Icons.local_shipping_rounded),
            ('Secure Payments', 'Razorpay-powered safe and encrypted payments', Icons.security_rounded),
            ('Order Tracking', 'Real-time status updates on every order', Icons.track_changes_rounded),
          ].map((item) => _FeatureItem(title: item.$1, subtitle: item.$2, icon: item.$3)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Contact Us', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 12),
              _ContactRow(icon: Icons.email_outlined, label: 'support@agoccare.com'),
              _ContactRow(icon: Icons.phone_outlined, label: '+91 98765 43210'),
              _ContactRow(icon: Icons.location_on_outlined, label: 'India'),
            ]),
          ),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title, content;
  const _Section({required this.title, required this.content});
  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
    const SizedBox(height: 8),
    Text(content, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.65)),
  ]);
}

class _FeatureItem extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  const _FeatureItem({required this.title, required this.subtitle, required this.icon});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(children: [
      Container(
        width: 42, height: 42,
        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ])),
    ]),
  );
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  const _ContactRow({required this.icon, required this.label});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Icon(icon, size: 18, color: AppColors.primary),
      const SizedBox(width: 10),
      Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
    ]),
  );
}
