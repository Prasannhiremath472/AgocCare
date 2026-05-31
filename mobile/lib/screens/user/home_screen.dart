import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchCtrl = TextEditingController();
  int _bannerIndex = 0;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final cartCount = ref.watch(cartCountProvider);
    final featured = ref.watch(featuredProductsProvider);
    final categories = ref.watch(categoriesProvider);
    final offers = ref.watch(offersProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F5F5),
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(featuredProductsProvider);
            ref.invalidate(categoriesProvider);
            ref.invalidate(offersProvider);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // ── Top Header ───────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  child: SafeArea(
                    bottom: false,
                    child: Column(
                      children: [
                        // Location + cart row
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                          child: Row(
                            children: [
                              // Location
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {},
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 36, height: 36,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.location_on, color: Colors.white, size: 18),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                  auth.user != null ? 'Hi, ${auth.user!.name.split(' ').first}!' : 'Home',
                                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                                ),
                                                const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textSecondary),
                                              ],
                                            ),
                                            const Text(
                                              'AgocCare — Your Health Partner',
                                              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              // Cart button
                              GestureDetector(
                                onTap: () => context.push(AppRoutes.cart),
                                child: Stack(
                                  children: [
                                    Container(
                                      width: 40, height: 40,
                                      decoration: BoxDecoration(
                                        color: AppColors.surface,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      child: const Icon(Icons.shopping_cart_outlined, size: 20, color: AppColors.textPrimary),
                                    ),
                                    if (cartCount > 0)
                                      Positioned(
                                        top: 0, right: 0,
                                        child: Container(
                                          width: 18, height: 18,
                                          decoration: const BoxDecoration(color: AppColors.cta, shape: BoxShape.circle),
                                          child: Center(
                                            child: Text('$cartCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Search bar
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                          child: GestureDetector(
                            onTap: () => context.push(AppRoutes.products),
                            child: Container(
                              height: 46,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0F0F0),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  const SizedBox(width: 14),
                                  const Icon(Icons.search, color: AppColors.textMuted, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Search for medicines, health products...",
                                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // ── Quick Action Buttons ──────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.push(AppRoutes.prescription),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.upload_file_rounded, color: Colors.white, size: 18),
                                SizedBox(width: 6),
                                Text('Upload Prescription', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.push(AppRoutes.products),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.medication_rounded, color: Colors.white, size: 18),
                                SizedBox(width: 6),
                                Text('Order Medicines', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // ── Category Cards ────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: categories.when(
                    data: (list) => list.isEmpty
                        ? const SizedBox()
                        : _CategoryCards(categories: list),
                    loading: () => SizedBox(
                      height: 110,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: 4,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (_, __) => ShimmerCard(height: 90, width: 90, radius: AppRadius.lg),
                      ),
                    ),
                    error: (_, __) => const SizedBox(),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // ── Offers Banner Carousel ────────────────────────────────────
              SliverToBoxAdapter(
                child: offers.when(
                  data: (list) => list.isEmpty
                      ? const SizedBox()
                      : _OffersBanner(offers: list, currentIndex: _bannerIndex,
                          onChanged: (i) => setState(() => _bannerIndex = i)),
                  loading: () => Padding(
                    padding: const EdgeInsets.all(16),
                    child: ShimmerCard(height: 160, width: double.infinity, radius: AppRadius.lg),
                  ),
                  error: (_, __) => const SizedBox(),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // ── Trending / Featured Products ──────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Trending Products', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      GestureDetector(
                        onTap: () => context.push(AppRoutes.products),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('View All', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              featured.when(
                data: (list) => list.isEmpty
                    ? const SliverToBoxAdapter(child: SizedBox())
                    : SliverToBoxAdapter(
                        child: Container(
                          color: Colors.white,
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          child: GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2, childAspectRatio: 0.65,
                              crossAxisSpacing: 10, mainAxisSpacing: 10,
                            ),
                            itemCount: list.length,
                            itemBuilder: (_, i) => ProductCard(product: list[i]),
                          ),
                        ),
                      ),
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: ShimmerProductGrid(),
                  ),
                ),
                error: (_, __) => const SliverToBoxAdapter(child: SizedBox()),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // ── Prescription Banner ───────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.secondary.withOpacity(0.15), AppColors.primaryLight],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: AppColors.secondary.withOpacity(0.25)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 52, height: 52,
                        decoration: BoxDecoration(color: AppColors.secondary.withOpacity(0.15), shape: BoxShape.circle),
                        child: const Icon(Icons.document_scanner_rounded, color: AppColors.secondary, size: 26),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Have a Prescription?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                            const Text('AI scans & finds your medicines instantly', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () => context.push(AppRoutes.prescription),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text('Upload Now', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 16)),
            ],
          ),
        ),

        // ── View Cart Floating Button (like screenshot) ───────────────────
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (cartCount > 0)
              GestureDetector(
                onTap: () => context.push(AppRoutes.cart),
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 4))],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 10),
                      Text('$cartCount Item${cartCount > 1 ? 's' : ''}',
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      const Text('View Cart', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 14),
                    ],
                  ),
                ),
              ),
            const AppBottomNav(currentIndex: 0),
          ],
        ),
      ),
    );
  }
}

// ── Category Cards (3-column grid like screenshot) ──────────────────────────
class _CategoryCards extends StatelessWidget {
  final List<CategoryModel> categories;
  const _CategoryCards({required this.categories});

  @override
  Widget build(BuildContext context) {
    final display = categories.take(6).toList();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: display.map((cat) {
          final imageUrl = AppHelpers.imgUrl(cat.image);
          return GestureDetector(
            onTap: () => context.push('${AppRoutes.products}?category=${cat.slug}'),
            child: SizedBox(
              width: (MediaQuery.of(context).size.width - 56) / 3,
              child: Column(
                children: [
                  Container(
                    height: 75,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(11),
                      child: imageUrl.isNotEmpty
                          ? AppImage(url: imageUrl, fit: BoxFit.cover, width: double.infinity, height: double.infinity)
                          : Center(child: Icon(Icons.category_rounded, color: AppColors.primary, size: 32)),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(cat.name,
                    textAlign: TextAlign.center, maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.2)),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Offers Banner with dot indicators ───────────────────────────────────────
class _OffersBanner extends StatelessWidget {
  final List<OfferModel> offers;
  final int currentIndex;
  final ValueChanged<int> onChanged;
  const _OffersBanner({required this.offers, required this.currentIndex, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CarouselSlider(
          options: CarouselOptions(
            height: 170,
            viewportFraction: 1.0,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 4),
            autoPlayCurve: Curves.easeInOut,
            onPageChanged: (i, _) => onChanged(i),
          ),
          items: offers.map((offer) {
            final imageUrl = AppHelpers.imgUrl(offer.image);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                gradient: AppGradients.primaryGradient,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (imageUrl.isNotEmpty)
                      AppImage(url: imageUrl, fit: BoxFit.cover, width: double.infinity, height: double.infinity),
                    // Gradient overlay
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.black.withOpacity(0.55), Colors.transparent],
                          begin: Alignment.bottomLeft, end: Alignment.topRight,
                        ),
                      ),
                    ),
                    // Text content
                    Positioned(
                      bottom: 16, left: 16,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(20)),
                            child: Text(offer.tag, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                          ),
                          const SizedBox(height: 4),
                          Text(offer.title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                          if (offer.subtitle != null)
                            Text(offer.subtitle!, style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                            child: Text(offer.btnLabel ?? 'SHOP NOW',
                              style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 10),
        // Dot indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(offers.length, (i) => AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: currentIndex == i ? 20 : 7,
            height: 7,
            decoration: BoxDecoration(
              color: currentIndex == i ? AppColors.primary : AppColors.border,
              borderRadius: BorderRadius.circular(4),
            ),
          )),
        ),
      ],
    );
  }
}
