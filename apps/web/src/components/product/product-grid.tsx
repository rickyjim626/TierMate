'use client';

import { ProductCard } from './product-card';

const mockProducts = [
  {
    id: '1',
    title: 'Apple AirPods Pro 2',
    description: '第二代主动降噪耳机，音质出色，降噪效果一流',
    imageUrl: 'https://picsum.photos/seed/airpods/400/400',
    price: 1899,
    likes: 1234,
    comments: 89,
    author: {
      name: '数码达人',
      avatar: 'https://picsum.photos/seed/user1/100/100',
    },
  },
  {
    id: '2',
    title: 'Sony WH-1000XM5',
    description: '索尼旗舰降噪耳机，30小时续航，佩戴舒适',
    imageUrl: 'https://picsum.photos/seed/sony/400/400',
    price: 2499,
    likes: 987,
    comments: 56,
    author: {
      name: '音乐爱好者',
      avatar: 'https://picsum.photos/seed/user2/100/100',
    },
  },
  {
    id: '3',
    title: 'MUJI 超声波香薰机',
    description: '简约设计，静音运行，提升生活品质',
    imageUrl: 'https://picsum.photos/seed/muji/400/400',
    price: 350,
    likes: 2456,
    comments: 134,
    author: {
      name: '生活美学家',
      avatar: 'https://picsum.photos/seed/user3/100/100',
    },
  },
  {
    id: '4',
    title: 'Kindle Paperwhite 5',
    description: '6.8英寸屏幕，防水设计，阅读神器',
    imageUrl: 'https://picsum.photos/seed/kindle/400/400',
    price: 1068,
    likes: 1567,
    comments: 78,
    author: {
      name: '书虫',
      avatar: 'https://picsum.photos/seed/user4/100/100',
    },
  },
  {
    id: '5',
    title: 'Lofree 洛斐小浪蓝牙音箱',
    description: '复古外观，Hi-Fi音质，颜值与实力并存',
    imageUrl: 'https://picsum.photos/seed/lofree/400/400',
    price: 499,
    likes: 876,
    comments: 45,
    author: {
      name: '复古控',
      avatar: 'https://picsum.photos/seed/user5/100/100',
    },
  },
  {
    id: '6',
    title: 'Anker 移动电源 20000mAh',
    description: '大容量快充，出行必备，安全可靠',
    imageUrl: 'https://picsum.photos/seed/anker/400/400',
    price: 199,
    likes: 3456,
    comments: 234,
    author: {
      name: '出行达人',
      avatar: 'https://picsum.photos/seed/user6/100/100',
    },
  },
];

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {mockProducts.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
