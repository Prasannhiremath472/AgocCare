import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/offer_model.dart';
import '../services/api_service.dart';
import 'auth_provider.dart';

// ── Product list state ────────────────────────────────────────────────────
class ProductListState {
  final List<ProductModel> products;
  final int total;
  final int pages;
  final int page;
  final bool isLoading;
  final String? error;

  const ProductListState({
    this.products = const [],
    this.total = 0,
    this.pages = 1,
    this.page = 1,
    this.isLoading = false,
    this.error,
  });

  ProductListState copyWith({
    List<ProductModel>? products,
    int? total,
    int? pages,
    int? page,
    bool? isLoading,
    String? error,
  }) {
    return ProductListState(
      products: products ?? this.products,
      total: total ?? this.total,
      pages: pages ?? this.pages,
      page: page ?? this.page,
      isLoading: isLoading ?? this.isLoading,
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
    fetch();
  }

  Future<void> fetch({int page = 1}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.getProducts(
        page: page,
        search: _search,
        category: _category,
        sort: _sort,
        order: _order,
      );
      state = ProductListState(
        products: res['products'] as List<ProductModel>,
        total: res['total'] as int,
        pages: res['pages'] as int,
        page: res['page'] as int,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void setSearch(String q) {
    _search = q;
    fetch();
  }

  void setCategory(String cat) {
    _category = cat;
    fetch();
  }

  void setSort(String sort, String order) {
    _sort = sort;
    _order = order;
    fetch();
  }

  void nextPage() {
    if (state.page < state.pages) fetch(page: state.page + 1);
  }

  void prevPage() {
    if (state.page > 1) fetch(page: state.page - 1);
  }
}

final productListProvider =
    StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
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
