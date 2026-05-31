import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../providers/products_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_card.dart';
import '../../widgets/app_bottom_nav.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  final String? initialCategory;
  const ProductsScreen({super.key, this.initialCategory});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedSort = 'created_at';
  String _selectedOrder = 'desc';

  final _sortOptions = const [
    {'label': 'Newest', 'sort': 'created_at', 'order': 'desc'},
    {'label': 'Price: Low to High', 'sort': 'price', 'order': 'asc'},
    {'label': 'Price: High to Low', 'sort': 'price', 'order': 'desc'},
    {'label': 'Name A-Z', 'sort': 'name', 'order': 'asc'},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(productListProvider.notifier).setCategory(widget.initialCategory!);
      });
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Sort by', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            ..._sortOptions.map((opt) => ListTile(
              title: Text(opt['label'] as String),
              leading: Radio<String>(
                value: '${opt['sort']}_${opt['order']}',
                groupValue: '${_selectedSort}_${_selectedOrder}',
                activeColor: AppColors.primary,
                onChanged: (v) {
                  setState(() {
                    _selectedSort = opt['sort'] as String;
                    _selectedOrder = opt['order'] as String;
                  });
                  ref.read(productListProvider.notifier).setSort(_selectedSort, _selectedOrder);
                  Navigator.pop(context);
                },
              ),
            )),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productListProvider);
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Medicines'),
        actions: [
          IconButton(icon: const Icon(Icons.sort_rounded), onPressed: _showSortSheet),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (v) => ref.read(productListProvider.notifier).setSearch(v),
              decoration: InputDecoration(
                hintText: 'Search medicines...',
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: AppColors.textMuted),
                        onPressed: () {
                          _searchCtrl.clear();
                          ref.read(productListProvider.notifier).setSearch('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              ),
            ),
          ),
          // Results count
          if (!state.isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text('${state.total} products found', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),
          const SizedBox(height: 8),
          // Grid
          Expanded(
            child: state.isLoading
                ? const Padding(padding: EdgeInsets.all(16), child: ShimmerProductGrid())
                : state.products.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off_rounded, size: 64, color: AppColors.textMuted),
                            SizedBox(height: 12),
                            Text('No products found', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2, childAspectRatio: 0.62, crossAxisSpacing: 12, mainAxisSpacing: 12,
                        ),
                        itemCount: state.products.length,
                        itemBuilder: (_, i) => ProductCard(product: state.products[i]),
                      ),
          ),
          // Pagination
          if (!state.isLoading && state.pages > 1)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: state.page > 1 ? () => ref.read(productListProvider.notifier).prevPage() : null,
                    color: AppColors.primary,
                  ),
                  Text('Page ${state.page} of ${state.pages}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: state.page < state.pages ? () => ref.read(productListProvider.notifier).nextPage() : null,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }
}
