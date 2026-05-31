import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bottom_nav.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Profile')),
      body: user == null
          ? Center(
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.person_outline, size: 80, color: AppColors.textMuted),
                const SizedBox(height: 16),
                const Text('Sign in to view your profile', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                const SizedBox(height: 20),
                ElevatedButton(onPressed: () => context.go(AppRoutes.login), child: const Text('Sign In')),
              ]),
            )
          : ListView(
              padding: EdgeInsets.zero,
              children: [
                // Header
                Container(
                  decoration: const BoxDecoration(gradient: AppGradients.heroGradient),
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                  child: Column(children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(user.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
                    const SizedBox(height: 4),
                    Text(user.email, style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
                    if (user.phone != null) ...[
                      const SizedBox(height: 2),
                      Text(user.phone!, style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
                    ],
                  ]),
                ),

                const SizedBox(height: 16),

                // Account section
                _SectionTitle(title: 'Account'),
                _MenuItem(icon: Icons.receipt_long_outlined, label: 'My Orders',
                  onTap: () => context.push(AppRoutes.orders)),
                _MenuItem(icon: Icons.document_scanner_outlined, label: 'Prescription Scanner',
                  onTap: () => context.push(AppRoutes.prescription)),

                const SizedBox(height: 8),
                _SectionTitle(title: 'Information'),
                _MenuItem(icon: Icons.info_outline, label: 'About AgocCare',
                  onTap: () => context.push(AppRoutes.about)),
                _MenuItem(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy',
                  onTap: () {}),
                _MenuItem(icon: Icons.help_outline, label: 'Help & Support',
                  onTap: () {}),

                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (_) => AlertDialog(
                          title: const Text('Sign Out'),
                          content: const Text('Are you sure you want to sign out?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                              child: const Text('Sign Out'),
                            ),
                          ],
                        ),
                      );
                      if (confirmed == true) {
                        await ref.read(authProvider.notifier).logout();
                        if (context.mounted) context.go(AppRoutes.login);
                      }
                    },
                    icon: const Icon(Icons.logout_rounded, color: AppColors.error),
                    label: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.error),
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 4),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
    child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
      color: AppColors.textMuted, letterSpacing: 0.8)),
  );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) => ListTile(
    tileColor: Colors.white,
    leading: Container(
      width: 38, height: 38,
      decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: AppColors.primary, size: 20),
    ),
    title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
    trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
    onTap: onTap,
  );
}
