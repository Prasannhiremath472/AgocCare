import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_image.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/products_provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/product_model.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  const ProductDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _selectedImage = 0;
  int _qty = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.slug));

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: productAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              const Text('Could not load product', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(productDetailProvider(widget.slug)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (product) {
          final allImages = [
            if (product.image != null) product.image!,
            ...product.images.map((i) => i.imagePath),
          ];
          // Guard against out-of-bounds if images changed
          if (_selectedImage >= allImages.length) {
            _selectedImage = 0;
          }
          final inCart = ref.watch(cartProvider.select(
            (items) => items.any((e) => e.product.id == product.id),
          ));

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 280,
                pinned: true,
                backgroundColor: Colors.white,
                foregroundColor: AppColors.textPrimary,
                elevation: 1,
                leading: GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 6)],
                    ),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
                  ),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: allImages.isNotEmpty
                      ? GestureDetector(
                          onTap: () => _showImageViewer(context, allImages.map(AppHelpers.imgUrl).toList(), _selectedImage),
                          child: AppImage(
                            url: AppHelpers.imgUrl(allImages[_selectedImage]),
                            fit: BoxFit.contain,
                          ),
                        )
                      : Container(
                          color: AppColors.primaryLight,
                          child: const Icon(Icons.medication_rounded, size: 80, color: AppColors.primary),
                        ),
                ),
              ),
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image thumbnails
                    if (allImages.length > 1)
                      SizedBox(
                        height: 70,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: allImages.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (_, i) => GestureDetector(
                            onTap: () {
                              setState(() => _selectedImage = i);
                              _showImageViewer(context, allImages.map(AppHelpers.imgUrl).toList(), i);
                            },
                            child: Container(
                              width: 54, height: 54,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: _selectedImage == i ? AppColors.primary : AppColors.border,
                                  width: _selectedImage == i ? 2 : 1,
                                ),
                              ),
                              child: AppImage(
                                url: AppHelpers.imgUrl(allImages[i]),
                                fit: BoxFit.cover,
                                borderRadius: BorderRadius.circular(7),
                              ),
                            ),
                          ),
                        ),
                      ),

                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Badges
                          Row(
                            children: [
                              if (product.prescriptionRequired)
                                _Badge(label: 'Prescription Required', color: AppColors.error),
                              if (product.prescriptionRequired) const SizedBox(width: 8),
                              if (!product.inStock)
                                _Badge(label: 'Out of Stock', color: AppColors.textMuted)
                              else
                                _Badge(label: 'In Stock', color: AppColors.success),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(product.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          if (product.manufacturer != null) ...[
                            const SizedBox(height: 4),
                            Text(product.manufacturer!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          ],
                          const SizedBox(height: 12),
                          // Price
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(AppHelpers.formatPrice(product.price),
                                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.primary)),
                              if (product.mrp != null && product.mrp! > product.price) ...[
                                const SizedBox(width: 8),
                                Text(AppHelpers.formatPrice(product.mrp!),
                                  style: const TextStyle(fontSize: 16, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(20)),
                                  child: Text('${product.discountPercent}% OFF',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                                ),
                              ],
                            ],
                          ),
                          const Divider(height: 28),
                          // Details
                          if (product.composition != null)
                            _DetailRow(label: 'Composition', value: product.composition!),
                          if (product.categoryName != null)
                            _DetailRow(label: 'Category', value: product.categoryName!),
                          if (product.expiryDate != null)
                            _DetailRow(label: 'Expiry Date', value: AppHelpers.formatDate(product.expiryDate)),
                          const SizedBox(height: 8),
                          if (product.description != null && product.description!.isNotEmpty) ...[
                            const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            const SizedBox(height: 8),
                            Text(product.description!, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6)),
                          ],
                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: productAsync.maybeWhen(
        data: (product) => _CartBar(product: product, qty: _qty, onQtyChange: (v) => setState(() => _qty = v)),
        orElse: () => const SizedBox(),
      ),
    );
  }

  void _showImageViewer(BuildContext context, List<String> images, int index) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'close',
      barrierColor: Colors.black,
      pageBuilder: (ctx, _, __) => _FullScreenImageViewer(images: images, initialIndex: index),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(20),
      border: Border.all(color: color.withOpacity(0.3))),
    child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
  );
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
        ],
      ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 36, height: 36,
      decoration: const BoxDecoration(),
      child: Icon(icon, size: 18, color: AppColors.primary),
    ),
  );
}

class _CartBar extends ConsumerWidget {
  final ProductModel product;
  final int qty;
  final ValueChanged<int> onQtyChange;
  const _CartBar({required this.product, required this.qty, required this.onQtyChange});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (!product.prescriptionRequired && !inCart) ...[
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    _QtyBtn(icon: Icons.remove, onTap: () { if (qty > 1) onQtyChange(qty - 1); }),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text('$qty', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    ),
                    _QtyBtn(icon: Icons.add, onTap: () => onQtyChange(qty + 1)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: SizedBox(
                height: 50,
                child: inCart
                    ? ElevatedButton.icon(
                        onPressed: () => context.push('/cart'),
                        icon: const Icon(Icons.shopping_cart_rounded),
                        label: const Text('Go to Cart',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      )
                    : ElevatedButton.icon(
                        onPressed: product.inStock && !product.prescriptionRequired
                            ? () {
                                ref.read(cartProvider.notifier).addItem(product, qty: qty);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Added to cart'),
                                    action: SnackBarAction(
                                      label: 'View Cart',
                                      textColor: AppColors.cta,
                                      onPressed: () => context.push('/cart'),
                                    ),
                                  ),
                                );
                              }
                            : null,
                        icon: Icon(product.prescriptionRequired
                            ? Icons.upload_file_rounded
                            : Icons.shopping_cart_rounded),
                        label: Text(
                          product.prescriptionRequired
                              ? 'Upload Prescription'
                              : product.inStock ? 'Add to Cart' : 'Out of Stock',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;
  const _FullScreenImageViewer({required this.images, required this.initialIndex});

  @override
  State<_FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<_FullScreenImageViewer> {
  late final PageController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: PageView.builder(
        controller: _ctrl,
        itemCount: widget.images.length,
        itemBuilder: (_, i) => InteractiveViewer(
          minScale: 0.5,
          maxScale: 4.0,
          child: Center(
            child: Image.network(
              widget.images[i],
              fit: BoxFit.contain,
              loadingBuilder: (_, child, progress) => progress == null
                  ? child
                  : const Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
              errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_rounded, color: Colors.white54, size: 64),
            ),
          ),
        ),
      ),
    );
  }
}
