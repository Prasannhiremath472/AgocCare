import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../widgets/app_image.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../core/helpers.dart';
import '../../providers/auth_provider.dart';
import '../../providers/products_provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/category_model.dart';
import '../../models/offer_model.dart';
import '../../models/product_model.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_card.dart';
import '../../widgets/app_bottom_nav.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final cartCount = ref.watch(cartCountProvider);
    final featured = ref.watch(featuredProductsProvider);
    final categories = ref.watch(categoriesProvider);
    final offers = ref.watch(offersProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('AgocCare', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            Text(auth.user != null ? 'Hi, ${auth.user!.name.split(' ').first}!' : 'Your health partner',
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.8), fontWeight: FontWeight.w400)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push(AppRoutes.products),
          ),
          Stack(
            children: [
              IconButton(icon: const Icon(Icons.shopping_cart_outlined), onPressed: () => context.push(AppRoutes.cart)),
              if (cartCount > 0)
                Positioned(
                  top: 6, right: 6,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(color: AppColors.cta, shape: BoxShape.circle),
                    child: Center(child: Text('$cartCount', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700))),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(featuredProductsProvider);
          ref.invalidate(categoriesProvider);
          ref.invalidate(offersProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner
              _HeroBanner(),
              const SizedBox(height: 20),

              // Quick Actions
              _QuickActions(),
              const SizedBox(height: 24),

              // Offers Carousel
              offers.when(
                data: (list) => list.isEmpty ? const SizedBox() : _OffersSection(offers: list),
                loading: () => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ShimmerCard(height: 140, width: double.infinity),
                ),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 24),

              // Categories
              _SectionHeader(title: 'Shop by Category', onSeeAll: () => context.push(AppRoutes.products)),
              const SizedBox(height: 12),
              categories.when(
                data: (list) => _CategoriesRow(categories: list),
                loading: () => SizedBox(
                  height: 100,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: 5,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (_, __) => const ShimmerCard(height: 80, width: 80),
                  ),
                ),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 24),

              // Featured Products
              _SectionHeader(title: 'Featured Products', onSeeAll: () => context.push(AppRoutes.products)),
              const SizedBox(height: 12),
              featured.when(
                data: (list) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, childAspectRatio: 0.62, crossAxisSpacing: 12, mainAxisSpacing: 12,
                    ),
                    itemCount: list.length,
                    itemBuilder: (_, i) => ProductCard(product: list[i]),
                  ),
                ),
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: ShimmerProductGrid(),
                ),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 32),

              // Prescription Banner
              _PrescriptionBanner(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      height: 160,
      decoration: BoxDecoration(
        gradient: AppGradients.heroGradient,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20, top: -20,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.07),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.cta,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('FREE DELIVERY', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 8),
                const Text('Get medicines\ndelivered fast', style: TextStyle(
                  color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, height: 1.2,
                )),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () => context.push(AppRoutes.products),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    minimumSize: Size.zero,
                    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  child: const Text('Shop Now'),
                ),
              ],
            ),
          ),
          Positioned(
            right: 16, bottom: 16,
            child: Icon(Icons.local_pharmacy_rounded, size: 72, color: Colors.white.withOpacity(0.2)),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  final _actions = const [
    {'icon': Icons.document_scanner_rounded, 'label': 'Prescription', 'route': AppRoutes.prescription, 'color': AppColors.secondary},
    {'icon': Icons.medication_rounded, 'label': 'Medicines', 'route': AppRoutes.products, 'color': AppColors.primary},
    {'icon': Icons.receipt_long_rounded, 'label': 'My Orders', 'route': AppRoutes.orders, 'color': AppColors.cta},
    {'icon': Icons.person_rounded, 'label': 'Profile', 'route': AppRoutes.profile, 'color': Color(0xFF8B5CF6)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: _actions.map((a) {
          final color = a['color'] as Color;
          return GestureDetector(
            onTap: () => context.push(a['route'] as String),
            child: Column(
              children: [
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(a['icon'] as IconData, color: color, size: 28),
                ),
                const SizedBox(height: 6),
                Text(a['label'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _OffersSection extends StatelessWidget {
  final List<OfferModel> offers;
  const _OffersSection({required this.offers});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text('Special Offers', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        ),
        const SizedBox(height: 12),
        CarouselSlider(
          options: CarouselOptions(
            height: 140,
            viewportFraction: 0.88,
            enlargeCenterPage: true,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 4),
          ),
          items: offers.map((offer) => _OfferCard(offer: offer)).toList(),
        ),
      ],
    );
  }
}

class _OfferCard extends StatelessWidget {
  final OfferModel offer;
  const _OfferCard({required this.offer});

  @override
  Widget build(BuildContext context) {
    final imageUrl = AppHelpers.imgUrl(offer.image);
    return Container(
      decoration: BoxDecoration(
        gradient: offer.bgGradient != null
            ? null
            : AppGradients.primaryGradient,
        color: offer.bgGradient != null ? AppColors.primaryLight : null,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Stack(
        children: [
          if (imageUrl.isNotEmpty)
            AppImage(
              url: imageUrl,
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              gradient: LinearGradient(
                colors: [Colors.black.withOpacity(0.5), Colors.transparent],
                begin: Alignment.bottomLeft,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(12)),
                  child: Text(offer.tag, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 4),
                Text(offer.title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                if (offer.subtitle != null)
                  Text(offer.subtitle!, style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoriesRow extends StatelessWidget {
  final List<CategoryModel> categories;
  const _CategoriesRow({required this.categories});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final cat = categories[i];
          final imageUrl = AppHelpers.imgUrl(cat.image);
          return GestureDetector(
            onTap: () {
              final notifier = context.findAncestorStateOfType<State>();
              context.push('${AppRoutes.products}?category=${cat.slug}');
            },
            child: Column(
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: imageUrl.isNotEmpty
                      ? AppImage(
                          url: imageUrl,
                          fit: BoxFit.cover,
                          borderRadius: BorderRadius.circular(16),
                        )
                      : const Icon(Icons.category_rounded, color: AppColors.primary, size: 30),
                ),
                const SizedBox(height: 6),
                SizedBox(
                  width: 64,
                  child: Text(cat.name, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback onSeeAll;
  const _SectionHeader({required this.title, required this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          TextButton(onPressed: onSeeAll, child: const Text('See all')),
        ],
      ),
    );
  }
}

class _PrescriptionBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.secondaryLight,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: AppColors.secondary.withOpacity(0.15), shape: BoxShape.circle),
            child: const Icon(Icons.document_scanner_rounded, color: AppColors.secondary, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Have a prescription?', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                const Text('Upload it and let AI find your medicines', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => context.push(AppRoutes.prescription),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    minimumSize: Size.zero,
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  child: const Text('Upload Now'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
