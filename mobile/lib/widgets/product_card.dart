import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../core/helpers.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';
import '../widgets/app_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Compact vertical card — used in trending/featured grids
class ProductCard extends ConsumerWidget {
  final ProductModel product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    final imageUrl = AppHelpers.imgUrl(product.image);
    final discount = product.discountPercent;

    return GestureDetector(
      onTap: () => context.push('/medicines/${product.slug}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image — compact height
            Stack(
              children: [
                AppImage(
                  url: imageUrl,
                  height: 100,
                  width: double.infinity,
                  fit: BoxFit.contain,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                  placeholder: Container(
                    height: 100,
                    color: AppColors.primaryLight,
                    child: const Center(child: Icon(Icons.medication_rounded, size: 36, color: AppColors.primary)),
                  ),
                ),
                if (discount > 0)
                  Positioned(
                    top: 6, left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(4)),
                      child: Text('$discount% OFF', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
                if (product.prescriptionRequired)
                  Positioned(
                    top: 6, right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(4)),
                      child: const Text('Rx', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
              ],
            ),
            // Info — Expanded so Spacer pushes button to bottom always
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(6, 5, 6, 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Fixed 2-line height — same space for all cards
                    SizedBox(
                      height: 28,
                      child: Text(product.name,
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.3)),
                    ),
                    const SizedBox(height: 3),
                    Text(AppHelpers.formatPrice(product.price),
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary)),
                    if (product.mrp != null && product.mrp! > product.price)
                      Text(AppHelpers.formatPrice(product.mrp!),
                        style: const TextStyle(fontSize: 9, color: AppColors.textMuted, decoration: TextDecoration.lineThrough),
                        overflow: TextOverflow.ellipsis),
                    // Pushes button to bottom regardless of content above
                    const Spacer(),
                    SizedBox(
                      width: double.infinity,
                      height: 26,
                      child: inCart
                          ? OutlinedButton(
                              onPressed: () => context.push('/cart'),
                              style: OutlinedButton.styleFrom(
                                padding: EdgeInsets.zero,
                                side: const BorderSide(color: AppColors.primary),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                              ),
                              child: const Text('In Cart', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.primary)),
                            )
                          : ElevatedButton(
                              onPressed: product.inStock && !product.prescriptionRequired
                                  ? () => ref.read(cartProvider.notifier).addItem(product)
                                  : null,
                              style: ElevatedButton.styleFrom(
                                padding: EdgeInsets.zero,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                textStyle: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700),
                              ),
                              child: Text(product.prescriptionRequired
                                  ? 'Rx Only'
                                  : product.inStock ? 'Add to Cart' : 'Sold Out'),
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Horizontal compact card — used in horizontal scroll lists
class ProductCardHorizontal extends ConsumerWidget {
  final ProductModel product;
  const ProductCardHorizontal({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    final imageUrl = AppHelpers.imgUrl(product.image);
    final discount = product.discountPercent;

    return GestureDetector(
      onTap: () => context.push('/medicines/${product.slug}'),
      child: Container(
        width: 140,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AppImage(
                  url: imageUrl,
                  height: 110,
                  width: 140,
                  fit: BoxFit.contain,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                  placeholder: Container(
                    height: 110, width: 140,
                    color: AppColors.primaryLight,
                    child: const Center(child: Icon(Icons.medication_rounded, size: 40, color: AppColors.primary)),
                  ),
                ),
                if (discount > 0)
                  Positioned(
                    top: 6, left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(4)),
                      child: Text('$discount% OFF', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                    maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.3)),
                  const SizedBox(height: 4),
                  Text(AppHelpers.formatPrice(product.price),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  if (product.mrp != null && product.mrp! > product.price)
                    Text(AppHelpers.formatPrice(product.mrp!),
                      style: const TextStyle(fontSize: 10, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    height: 28,
                    child: inCart
                        ? OutlinedButton(
                            onPressed: () => context.push('/cart'),
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.zero,
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            ),
                            child: const Text('In Cart ✓', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary)),
                          )
                        : ElevatedButton(
                            onPressed: product.inStock && !product.prescriptionRequired
                                ? () => ref.read(cartProvider.notifier).addItem(product)
                                : null,
                            style: ElevatedButton.styleFrom(
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
                            ),
                            child: Text(product.inStock ? 'ADD' : 'Out of Stock'),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
