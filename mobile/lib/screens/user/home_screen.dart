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
import '../../providers/location_provider.dart';
import '../../models/category_model.dart';
import '../../models/offer_model.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_card.dart';
import '../../widgets/app_bottom_nav.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _bannerIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final cartCount = ref.watch(cartCountProvider);
    final featured = ref.watch(featuredProductsProvider);
    final categories = ref.watch(categoriesProvider);
    final offers = ref.watch(offersProvider);
    final location = ref.watch(locationProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: const Color(0xFFF2F4F7),
        // ── Fixed header + search (never scrolls) ────────
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(118),
          child: Container(
            color: Colors.white,
            child: SafeArea(
              bottom: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Location row
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.location_on,
                              color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    auth.user != null
                                        ? 'Hi, ${auth.user!.name.split(' ').first}!'
                                        : 'Home',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF1A1A2E),
                                    ),
                                  ),
                                  const Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      size: 18,
                                      color: Color(0xFF666666)),
                                ],
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.location_on,
                                      size: 11, color: AppColors.primary),
                                  const SizedBox(width: 2),
                                  Expanded(
                                    child: Text(
                                      location.isLoading
                                          ? 'Detecting location...'
                                          : location.city.isNotEmpty
                                              ? 'Delivering to ${location.city}'
                                              : 'AgocCare – Your Health Partner',
                                      style: const TextStyle(
                                          fontSize: 11,
                                          color: Color(0xFF888888)),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // Cart icon
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.cart),
                          child: Stack(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF5F5F5),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: const Color(0xFFEEEEEE)),
                                ),
                                child: const Icon(Icons.shopping_bag_outlined,
                                    size: 20, color: Color(0xFF333333)),
                              ),
                              if (cartCount > 0)
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: Container(
                                    width: 16,
                                    height: 16,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFE53935),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: Text(
                                        '$cartCount',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Search bar
                  GestureDetector(
                    onTap: () => context.push(AppRoutes.products),
                    child: Container(
                      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: const Color(0xFFE0E0E0)),
                      ),
                      child: const Row(
                        children: [
                          SizedBox(width: 14),
                          Icon(Icons.search,
                              color: Color(0xFFAAAAAA), size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Search for medicines...',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  color: Color(0xFFAAAAAA), fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // ── Scrollable body ───────────────────────────────
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(featuredProductsProvider);
            ref.invalidate(categoriesProvider);
            ref.invalidate(offersProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Action buttons
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.push(AppRoutes.prescription),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.upload_file_rounded,
                                    color: Colors.white, size: 17),
                                SizedBox(width: 6),
                                Text('Upload Prescription',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700)),
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
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00A650),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.medication_rounded,
                                    color: Colors.white, size: 17),
                                SizedBox(width: 6),
                                Text('Order Medicines',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700)),
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
              // Offer Banner
              SliverToBoxAdapter(
                child: offers.when(
                  data: (list) => list.isEmpty
                      ? _FallbackBanner()
                      : _BannerCarousel(
                          offers: list,
                          index: _bannerIndex,
                          onChanged: (i) => setState(() => _bannerIndex = i),
                        ),
                  loading: () => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    height: 150,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEEEEE),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  error: (_, __) => _FallbackBanner(),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 8)),
              // Popular Categories
              SliverToBoxAdapter(
                child: Container(
                  color: const Color(0xFFFFF8F0),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Popular Categories',
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1A1A2E))),
                      categories.when(
                        data: (list) => _CategoriesGrid(categories: list),
                        loading: () => GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 4,
                            childAspectRatio: 0.95,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 6,
                          ),
                          itemCount: 8,
                          itemBuilder: (_, __) =>
                              const ShimmerCard(height: 80),
                        ),
                        error: (_, __) => const SizedBox(),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 8)),
              // Trending Products
              SliverToBoxAdapter(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(0, 16, 0, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Trending Products',
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF1A1A2E))),
                            GestureDetector(
                              onTap: () => context.push(AppRoutes.products),
                              child: const Text('View all',
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      featured.when(
                        data: (list) => SizedBox(
                          height: 270,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: list.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 10),
                            itemBuilder: (_, i) =>
                                ProductCardH(product: list[i]),
                          ),
                        ),
                        loading: () => SizedBox(
                          height: 270,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: 4,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 10),
                            itemBuilder: (_, __) =>
                                const ShimmerCard(height: 270, width: 155),
                          ),
                        ),
                        error: (_, __) => const SizedBox(),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 8)),
              // Prescription Banner
              SliverToBoxAdapter(
                child: GestureDetector(
                  onTap: () => context.push(AppRoutes.prescription),
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF044B99), Color(0xFF079DDF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.document_scanner_rounded,
                              color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Have a Prescription?',
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white)),
                              SizedBox(height: 2),
                              Text('Upload & get medicines instantly',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.white70)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('Upload',
                              style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
          ),
        ),
        // ── Bottom nav ────────────────────────────────────
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (cartCount > 0)
              GestureDetector(
                onTap: () => context.push(AppRoutes.cart),
                child: Container(
                  margin: const EdgeInsets.fromLTRB(12, 0, 12, 6),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 13),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shopping_cart_rounded,
                          color: Colors.white, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        '$cartCount item${cartCount > 1 ? 's' : ''} in cart',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Spacer(),
                      const Text('View Cart →',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700)),
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

// ── Fallback Banner when no offers ───────────────────────────────────────────
class _FallbackBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 130,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF044B99), Color(0xFF079DDF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Get medicines\ndelivered fast',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        height: 1.2)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => context.push(AppRoutes.products),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20)),
                    child: const Text('Shop Now',
                        style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.local_pharmacy_rounded,
              color: Colors.white24, size: 60),
        ],
      ),
    );
  }
}

// ── Banner Carousel ───────────────────────────────────────────────────────────
class _BannerCarousel extends StatelessWidget {
  final List<OfferModel> offers;
  final int index;
  final ValueChanged<int> onChanged;
  const _BannerCarousel(
      {required this.offers,
      required this.index,
      required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CarouselSlider(
          options: CarouselOptions(
            height: 150,
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
                gradient: const LinearGradient(
                  colors: [Color(0xFF044B99), Color(0xFF079DDF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (imageUrl.isNotEmpty)
                      AppImage(
                          url: imageUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withValues(alpha: 0.45),
                            Colors.transparent
                          ],
                          begin: Alignment.bottomLeft,
                          end: Alignment.topRight,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 14,
                      left: 16,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                                color: const Color(0xFF00A650),
                                borderRadius: BorderRadius.circular(20)),
                            child: Text(offer.tag,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800)),
                          ),
                          const SizedBox(height: 4),
                          Text(offer.title,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800)),
                          if (offer.subtitle != null)
                            Text(offer.subtitle!,
                                style: const TextStyle(
                                    color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            offers.length,
            (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: index == i ? 20 : 7,
              height: 7,
              decoration: BoxDecoration(
                color: index == i
                    ? AppColors.primary
                    : const Color(0xFFCCCCCC),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Categories Grid ───────────────────────────────────────────────────────────
class _CategoriesGrid extends StatelessWidget {
  final List<CategoryModel> categories;
  const _CategoriesGrid({required this.categories});

  static const _bgColors = [
    Color(0xFFFFF3E0),
    Color(0xFFE8F5E9),
    Color(0xFFE3F2FD),
    Color(0xFFFCE4EC),
    Color(0xFFEDE7F6),
    Color(0xFFE0F7FA),
    Color(0xFFFFF8E1),
    Color(0xFFF3E5F5),
  ];

  @override
  Widget build(BuildContext context) {
    final display = categories.take(8).toList();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.95,
        crossAxisSpacing: 10,
        mainAxisSpacing: 6,
      ),
      itemCount: display.length,
      itemBuilder: (_, i) {
        final cat = display[i];
        final imageUrl = AppHelpers.imgUrl(cat.image);
        final bg = _bgColors[i % _bgColors.length];
        return GestureDetector(
          onTap: () =>
              context.push('${AppRoutes.products}?category=${cat.slug}'),
          child: Column(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: imageUrl.isNotEmpty
                      ? AppImage(
                          url: imageUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                        )
                      : Container(
                          color: bg,
                          child: const Center(
                            child: Icon(Icons.category_rounded,
                                color: AppColors.primary, size: 32),
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 5),
              Text(
                cat.name,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                  height: 1.2,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
