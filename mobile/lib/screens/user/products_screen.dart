import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/products_provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/category_model.dart';
import '../../models/product_model.dart';
import '../../widgets/app_image.dart';
import '../../widgets/app_bottom_nav.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  final String? initialCategory;
  const ProductsScreen({super.key, this.initialCategory});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  String? _selectedCategorySlug;
  String? _selectedCategoryName;
  String _search = '';
  final _searchCtrl = TextEditingController();
  final _leftScrollCtrl = ScrollController();
  final _gridScrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      _selectedCategorySlug = widget.initialCategory;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _applyFilters();
    });
    _gridScrollCtrl.addListener(() {
      final pos = _gridScrollCtrl.position;
      if (pos.pixels >= pos.maxScrollExtent * 0.6) {
        ref.read(productListProvider.notifier).loadMore();
      }
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _leftScrollCtrl.dispose();
    _gridScrollCtrl.dispose();
    super.dispose();
  }

  void _applyFilters() {
    // Only trigger if a specific category was requested via deep-link
    if (widget.initialCategory != null) {
      ref.read(productListProvider.notifier).setCategory(_selectedCategorySlug ?? '');
    }
  }

  void _selectCategory(CategoryModel? cat) {
    setState(() {
      _selectedCategorySlug = cat?.slug;
      _selectedCategoryName = cat?.name;
    });
    ref.read(productListProvider.notifier).setCategory(cat?.slug ?? '');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productListProvider);
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF2D2D2D), size: 20),
          onPressed: () => context.pop(),
        ),
        title: GestureDetector(
          onTap: () {},
          child: Container(
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (v) {
                setState(() => _search = v);
                ref.read(productListProvider.notifier).setSearch(v);
              },
              decoration: InputDecoration(
                hintText: 'Search medicines...',
                hintStyle: const TextStyle(color: Color(0xFFAAAAAA), fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFAAAAAA), size: 18),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16, color: Color(0xFFAAAAAA)),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _search = '');
                          ref.read(productListProvider.notifier).setSearch('');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: Color(0xFF2D2D2D)),
            onPressed: () => _showSortSheet(),
          ),
        ],
      ),
      body: Row(
        children: [
          // ── LEFT: Category Sidebar ───────────────────
          Container(
            width: 88,
            color: const Color(0xFFF0F0F0),
            child: categories.when(
              data: (list) {
                // Add "All" at top
                final allCats = <CategoryModel?>[null, ...list];
                return ListView.builder(
                  controller: _leftScrollCtrl,
                  itemCount: allCats.length,
                  itemBuilder: (_, i) {
                    final cat = allCats[i];
                    final isSelected = cat == null
                        ? _selectedCategorySlug == null
                        : cat.slug == _selectedCategorySlug;
                    final imageUrl = cat != null ? AppHelpers.imgUrl(cat.image) : '';

                    return GestureDetector(
                      onTap: () => _selectCategory(cat),
                      child: Container(
                        color: isSelected ? Colors.white : Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
                        child: Column(
                          children: [
                            // Left accent bar for selected
                            if (isSelected)
                              Container()
                            else
                              Container(),
                            // Category image/icon
                            Container(
                              width: 54, height: 54,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFFF0F4FF)
                                    : const Color(0xFFE8E8E8),
                                borderRadius: BorderRadius.circular(10),
                                border: isSelected
                                    ? Border.all(color: AppColors.primary, width: 1.5)
                                    : null,
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(9),
                                child: cat == null
                                    ? const Icon(Icons.grid_view_rounded,
                                        color: AppColors.primary, size: 26)
                                    : imageUrl.isNotEmpty
                                        ? AppImage(url: imageUrl, fit: BoxFit.cover,
                                            width: 54, height: 54)
                                        : const Icon(Icons.category_rounded,
                                            color: AppColors.primary, size: 26),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              cat == null ? 'All' : cat.name,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? AppColors.primary : const Color(0xFF555555),
                                height: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
              error: (_, __) => const SizedBox(),
            ),
          ),

          // ── RIGHT: Products ──────────────────────────
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category header + count
                if (_selectedCategoryName != null || _selectedCategorySlug == null)
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _selectedCategoryName ?? 'All Medicines',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF1A1A2E)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (!state.isLoading)
                          Text('${state.total}',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF888888))),
                      ],
                    ),
                  ),

                // Products grid — never unmount, avoids full rebuild/flash
                Expanded(
                  child: state.isLoading && state.products.isEmpty
                      ? const Center(child: CircularProgressIndicator(
                          color: AppColors.primary, strokeWidth: 2))
                      : state.products.isEmpty
                          ? const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.search_off_rounded, size: 48,
                                      color: Color(0xFFCCCCCC)),
                                  SizedBox(height: 8),
                                  Text('No products found',
                                      style: TextStyle(
                                          fontSize: 14, color: Color(0xFF888888))),
                                ],
                              ),
                            )
                          : CustomScrollView(
                              controller: _gridScrollCtrl,
                              slivers: [
                                // Subtle refresh indicator at top during background fetch
                                if (state.isLoading)
                                  const SliverToBoxAdapter(
                                    child: LinearProgressIndicator(
                                      minHeight: 2,
                                      color: AppColors.primary,
                                      backgroundColor: Colors.transparent,
                                    ),
                                  ),
                                SliverPadding(
                                  padding: const EdgeInsets.all(10),
                                  sliver: SliverGrid(
                                    gridDelegate:
                                        const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 2,
                                      childAspectRatio: 0.58,
                                      crossAxisSpacing: 8,
                                      mainAxisSpacing: 8,
                                    ),
                                    delegate: SliverChildBuilderDelegate(
                                      (_, i) => _ProductCard(
                                        key: ValueKey(state.products[i].id),
                                        product: state.products[i],
                                      ),
                                      childCount: state.products.length,
                                      addAutomaticKeepAlives: true,
                                      addRepaintBoundaries: true,
                                    ),
                                  ),
                                ),
                                if (state.isLoadingMore)
                                  const SliverToBoxAdapter(
                                    child: Padding(
                                      padding: EdgeInsets.symmetric(vertical: 16),
                                      child: Center(
                                          child: CircularProgressIndicator(
                                              color: AppColors.primary,
                                              strokeWidth: 2)),
                                    ),
                                  ),
                              ],
                            ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Sort by', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            ...[
              ['Newest First', 'created_at', 'desc'],
              ['Price: Low to High', 'price', 'asc'],
              ['Price: High to Low', 'price', 'desc'],
              ['Name A–Z', 'name', 'asc'],
            ].map((opt) => ListTile(
              title: Text(opt[0]),
              leading: const Icon(Icons.sort_rounded, color: AppColors.primary),
              onTap: () {
                ref.read(productListProvider.notifier).setSort(opt[1], opt[2]);
                Navigator.pop(context);
              },
            )),
          ],
        ),
      ),
    );
  }
}

// ── Product Card (1mg list style) ────────────────────────────────────────────
class _ProductCard extends StatelessWidget {
  final ProductModel product;
  const _ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final imageUrl = AppHelpers.imgUrl(product.image);
    final disc = product.discountPercent;

    return RepaintBoundary(
      child: GestureDetector(
      onTap: () => context.push('/medicines/${product.slug}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image — isolated so cart changes never repaint it
            RepaintBoundary(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                    child: Container(
                      height: 110, width: double.infinity,
                      color: Colors.white,
                      child: AppImage(
                        url: imageUrl,
                        height: 110, width: double.infinity,
                        fit: BoxFit.contain,
                        placeholder: Container(
                          height: 110,
                          color: Colors.white,
                          child: const Center(child: Icon(Icons.medication_rounded,
                              size: 36, color: AppColors.primary)),
                        ),
                      ),
                    ),
                  ),
                  if (disc > 0)
                    Positioned(
                      top: 0, left: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: const BoxDecoration(
                          color: Color(0xFF00A650),
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(10),
                            bottomRight: Radius.circular(8),
                          ),
                        ),
                        child: Text('$disc% off',
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                      ),
                    ),
                  if (product.prescriptionRequired)
                    Positioned(
                      top: 6, right: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade600,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Rx',
                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                      ),
                    ),
                ],
              ),
            ),
            // Info + button
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 7, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 30,
                      child: Text(product.name,
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.w600,
                          color: Color(0xFF2D2D2D), height: 1.3)),
                    ),
                    const SizedBox(height: 4),
                    Text(AppHelpers.formatPrice(product.price),
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF2D2D2D))),
                    if (product.mrp != null && product.mrp! > product.price)
                      Text(AppHelpers.formatPrice(product.mrp!),
                        style: const TextStyle(fontSize: 10, color: Color(0xFF999999),
                          decoration: TextDecoration.lineThrough)),
                    const Spacer(),
                    _AddButton(product: product),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ),
    );
  }
}

class _AddButton extends ConsumerWidget {
  final ProductModel product;
  const _AddButton({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    return SizedBox(
      width: double.infinity,
      height: 28,
      child: inCart
          ? OutlinedButton(
              onPressed: () => context.push('/cart'),
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.zero,
                side: const BorderSide(color: AppColors.primary, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              child: const Text('ADDED ✓',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary)))
          : ElevatedButton(
              onPressed: product.inStock && !product.prescriptionRequired
                  ? () => ref.read(cartProvider.notifier).addItem(product)
                  : null,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.zero,
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                elevation: 0,
              ),
              child: Text(
                product.prescriptionRequired ? 'Rx Only'
                    : product.inStock ? 'ADD' : 'Sold Out',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800))),
    );
  }
}
