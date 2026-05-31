import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../core/helpers.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';
import '../widgets/app_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: [
            BoxShadow(color: AppColors.primary.withOpacity(0.07), blurRadius: 12, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(
              children: [
                AppImage(
                  url: imageUrl,
                  height: 130,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
                  placeholder: _imagePlaceholder(),
                ),
                if (discount > 0)
                  Positioned(
                    top: 8, left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.cta, borderRadius: BorderRadius.circular(20)),
                      child: Text('$discount% OFF', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
                  ),
                if (product.prescriptionRequired)
                  Positioned(
                    top: 8, right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.error.withOpacity(0.9), borderRadius: BorderRadius.circular(6)),
                      child: const Text('Rx', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
                  ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  if (product.manufacturer != null)
                    Text(product.manufacturer!, maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(AppHelpers.formatPrice(product.price),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                      if (product.mrp != null && product.mrp! > product.price) ...[
                        const SizedBox(width: 4),
                        Text(AppHelpers.formatPrice(product.mrp!),
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted,
                            decoration: TextDecoration.lineThrough)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 34,
                    child: inCart
                        ? OutlinedButton.icon(
                            onPressed: () => context.push('/cart'),
                            icon: const Icon(Icons.shopping_cart, size: 14),
                            label: const Text('In Cart', style: TextStyle(fontSize: 12)),
                          )
                        : ElevatedButton(
                            onPressed: product.inStock
                                ? () => ref.read(cartProvider.notifier).addItem(product)
                                : null,
                            style: ElevatedButton.styleFrom(
                              padding: EdgeInsets.zero,
                              textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            child: Text(product.inStock ? 'Add to Cart' : 'Out of Stock'),
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

  Widget _imagePlaceholder() => Container(
    height: 130,
    color: AppColors.primaryLight,
    child: const Center(child: Icon(Icons.medication_rounded, size: 48, color: AppColors.primary)),
  );
}
