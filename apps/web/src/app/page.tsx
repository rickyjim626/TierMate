import { Header } from '@/components/layout/header';
import { ProductGrid } from '@/components/product/product-grid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            发现好物，分享美好
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            TierMate 是一个好物分享平台，在这里你可以发现优质产品，
            分享你的使用体验，与志同道合的人交流心得。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            热门推荐
          </h2>
          <ProductGrid />
        </section>
      </main>
    </div>
  );
}
