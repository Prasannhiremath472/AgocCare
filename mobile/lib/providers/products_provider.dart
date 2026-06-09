import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/offer_model.dart';
import '../services/api_service.dart';
import 'auth_provider.dart';

const _cacheKey = 'agoc_products_cache';

// ── Product list state ────────────────────────────────────────────────────
class ProductListState {
  final List<ProductModel> products;
  final int total;
  final int pages;
  final int page;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final String? error;

  const ProductListState({
    this.products = const [],
    this.total = 0,
    this.pages = 1,
    this.page = 1,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = false,
    this.error,
  });

  ProductListState copyWith({
    List<ProductModel>? products,
    int? total,
    int? pages,
    int? page,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    String? error,
  }) {
    return ProductListState(
      products: products ?? this.products,
      total: total ?? this.total,
      pages: pages ?? this.pages,
      page: page ?? this.page,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      error: error,
    );
  }
}

class ProductListNotifier extends StateNotifier<ProductListState> {
  final ApiService _api;
  String _search = '';
  String _category = '';
  String _sort = 'created_at';
  String _order = 'desc';

  ProductListNotifier(this._api) : super(const ProductListState()) {
    _initWithCache();
  }

  // Show cached products instantly, then refresh from network silently
  Future<void> _initWithCache() async {
    // Only use cache for default (no search/category/sort) view
    if (_search.isEmpty && _category.isEmpty) {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw != null) {
        try {
          final list = (jsonDecode(raw) as List<dynamic>)
              .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
              .toList();
          if (list.isNotEmpty) {
            state = ProductListState(
              products: list,
              isLoading: false,
              hasMore: true,
            );
          }
        } catch (_) {}
      }
    }
    // Fetch fresh data — if cache was shown, this runs silently in background
    await fetch();
  }

  Future<void> _saveCache(List<ProductModel> products) async {
    if (_search.isNotEmpty || _category.isNotEmpty) return; // only cache default view
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = jsonEncode(products.map((p) => p.toJson()).toList());
      await prefs.setString(_cacheKey, json);
    } catch (_) {}
  }

  Future<void> fetch({int page = 1}) async {
    final hasCache = state.products.isNotEmpty;
    // Only show full-screen spinner when there's nothing to show yet
    if (!hasCache) state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.getProducts(
        page: page,
        search: _search,
        category: _category,
        sort: _sort,
        order: _order,
      );
      final pages = res['pages'] as int;
      final currentPage = res['page'] as int;
      final fresh = res['products'] as List<ProductModel>;

      // Skip state update if network returned same data as cache (avoids grid rebuild/flash)
      if (hasCache && _listsEqual(state.products, fresh)) {
        state = state.copyWith(isLoading: false, hasMore: currentPage < pages);
        return;
      }

      state = ProductListState(
        products: fresh,
        total: res['total'] as int,
        pages: pages,
        page: currentPage,
        isLoading: false,
        hasMore: currentPage < pages,
      );
      _saveCache(fresh);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: state.products.isEmpty ? e.toString() : null,
      );
    }
  }

  bool _listsEqual(List<ProductModel> a, List<ProductModel> b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i].id != b[i].id || a[i].price != b[i].price) return false;
    }
    return true;
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore) return;
    final nextPage = state.page + 1;
    state = state.copyWith(isLoadingMore: true);
    try {
      final res = await _api.getProducts(
        page: nextPage,
        search: _search,
        category: _category,
        sort: _sort,
        order: _order,
      );
      final pages = res['pages'] as int;
      final currentPage = res['page'] as int;
      state = state.copyWith(
        products: [...state.products, ...res['products'] as List<ProductModel>],
        total: res['total'] as int,
        pages: pages,
        page: currentPage,
        isLoadingMore: false,
        hasMore: currentPage < pages,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  void setSearch(String q) {
    _search = q;
    state = state.copyWith(isLoading: true, products: [], hasMore: false);
    fetch();
  }

  void setCategory(String cat) {
    if (_category == cat) return; // avoid redundant re-fetch on nav back
    _category = cat;
    state = state.copyWith(isLoading: true, products: [], hasMore: false);
    fetch();
  }

  void setSort(String sort, String order) {
    _sort = sort;
    _order = order;
    state = state.copyWith(isLoading: true, products: [], hasMore: false);
    fetch();
  }
}

final productListProvider =
    StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
  ref.keepAlive();
  return ProductListNotifier(ref.read(apiServiceProvider));
});

// ── Featured products ─────────────────────────────────────────────────────
final featuredProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  return ref.read(apiServiceProvider).getFeaturedProducts();
});

// ── Single product ────────────────────────────────────────────────────────
final productDetailProvider =
    FutureProvider.family<ProductModel, String>((ref, slug) async {
  return ref.read(apiServiceProvider).getProduct(slug);
});

// ── Categories ────────────────────────────────────────────────────────────
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  return ref.read(apiServiceProvider).getCategories();
});

// ── Offers ────────────────────────────────────────────────────────────────
final offersProvider = FutureProvider<List<OfferModel>>((ref) async {
  return ref.read(apiServiceProvider).getOffers();
});
