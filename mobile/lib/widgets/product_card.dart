import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../core/helpers.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';
import '../widgets/app_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Tata 1mg style vertical product card
class ProductCard extends ConsumerWidget {
  final ProductModel product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    final imageUrl = AppHelpers.imgUrl(product.image);
    final disc = product.discountPercent;

    return GestureDetector(
      onTap: () => context.push('/medicines/${product.slug}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEEEEEE)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Image ─────────────────────────────────────
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Container(
                    color: Colors.white,
                    child: AppImage(
                      url: imageUrl,
                      height: 110,
                      width: double.infinity,
                      fit: BoxFit.contain,
                      placeholder: Container(
                        height: 110,
                        color: Colors.white,
                        child: const Center(
                          child: Icon(Icons.medication_rounded, size: 40, color: AppColors.primary),
                        ),
                      ),
                    ),
                  ),
                ),
                // Discount badge — top left (1mg style green)
                if (disc > 0)
                  Positioned(
                    top: 0, left: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: const BoxDecoration(
                        color: Color(0xFF00A650),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(12),
                          bottomRight: Radius.circular(8),
                        ),
                      ),
                      child: Text('$disc% off',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
                // Rx badge
                if (product.prescriptionRequired)
                  Positioned(
                    top: 6, right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade600,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('Rx', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
                // Rating badge — bottom left
                Positioned(
                  bottom: 4, left: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF388E3C),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('4.4', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                        SizedBox(width: 2),
                        Icon(Icons.star, color: Colors.white, size: 9),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // ── Info ──────────────────────────────────────
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 7, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product name
                    SizedBox(
                      height: 30,
                      child: Text(product.name,
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.w600,
                          color: Color(0xFF2D2D2D), height: 1.3,
                        )),
                    ),
                    // Pack size / composition
                    if (product.composition != null && product.composition!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(product.composition!,
                        maxLines: 1, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 9.5, color: Color(0xFF888888))),
                    ],
                    const SizedBox(height: 4),
                    // Price row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(AppHelpers.formatPrice(product.price),
                          style: const TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w800,
                            color: Color(0xFF2D2D2D),
                          )),
                        if (product.mrp != null && product.mrp! > product.price) ...[
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(AppHelpers.formatPrice(product.mrp!),
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 10, color: Color(0xFF999999),
                                decoration: TextDecoration.lineThrough,
                              )),
                          ),
                        ],
                      ],
                    ),
                    // Discount % label
                    if (disc > 0) ...[
                      const SizedBox(height: 2),
                      Text('$disc% off',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF00A650))),
                    ],
                    const Spacer(),
                    // ADD button — 1mg style
                    SizedBox(
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
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary)),
                            )
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
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                              ),
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

// Horizontal card for home screen
class ProductCardH extends ConsumerWidget {
  final ProductModel product;
  const ProductCardH({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inCart = ref.watch(cartProvider.select(
      (items) => items.any((e) => e.product.id == product.id),
    ));
    final imageUrl = AppHelpers.imgUrl(product.image);
    final disc = product.discountPercent;

    return GestureDetector(
      onTap: () => context.push('/medicines/${product.slug}'),
      child: Container(
        width: 150,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEEEEEE)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Container(
                    color: Colors.white,
                    child: AppImage(
                      url: imageUrl, height: 120, width: 150,
                      fit: BoxFit.contain,
                      placeholder: Container(height: 120, width: 150,
                        color: Colors.white,
                        child: const Center(child: Icon(Icons.medication_rounded, size: 40, color: AppColors.primary))),
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
                        borderRadius: BorderRadius.only(topLeft: Radius.circular(12), bottomRight: Radius.circular(8)),
                      ),
                      child: Text('$disc% off', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                  ),
              ],
            ),
            Expanded(
              child: Padding(
              padding: const EdgeInsets.fromLTRB(8, 7, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF2D2D2D), height: 1.3)),
                  const SizedBox(height: 4),
                  Text(AppHelpers.formatPrice(product.price),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF2D2D2D))),
                  if (product.mrp != null && product.mrp! > product.price)
                    Text(AppHelpers.formatPrice(product.mrp!),
                      style: const TextStyle(fontSize: 10, color: Color(0xFF999999), decoration: TextDecoration.lineThrough)),
                  if (disc > 0)
                    Text('$disc% off',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF00A650))),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity, height: 28,
                    child: inCart
                        ? OutlinedButton(
                            onPressed: () => context.push('/cart'),
                            style: OutlinedButton.styleFrom(padding: EdgeInsets.zero,
                              side: const BorderSide(color: AppColors.primary, width: 1.5),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))),
                            child: const Text('ADDED ✓', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary)))
                        : ElevatedButton(
                            onPressed: product.inStock && !product.prescriptionRequired
                                ? () => ref.read(cartProvider.notifier).addItem(product) : null,
                            style: ElevatedButton.styleFrom(padding: EdgeInsets.zero,
                              backgroundColor: Colors.white, foregroundColor: AppColors.primary,
                              side: const BorderSide(color: AppColors.primary, width: 1.5),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)), elevation: 0),
                            child: Text(product.inStock ? 'ADD' : 'Sold Out',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800))),
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
