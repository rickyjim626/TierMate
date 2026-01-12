import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 8 个商品分类
const categories = [
  { name: '衣', description: '服装穿搭', icon: 'shirt', sortOrder: 1, color: '#F87171' },
  { name: '食', description: '美食推荐', icon: 'utensils', sortOrder: 2, color: '#FB923C' },
  { name: '住', description: '居住环境', icon: 'home', sortOrder: 3, color: '#FBBF24' },
  { name: '厨房', description: '厨房用品', icon: 'chef-hat', sortOrder: 4, color: '#A3E635' },
  { name: '卧室', description: '卧室用品', icon: 'bed', sortOrder: 5, color: '#34D399' },
  { name: '化妆品', description: '美妆护肤', icon: 'sparkles', sortOrder: 6, color: '#F472B6' },
  { name: '母婴用品', description: '母婴相关', icon: 'baby', sortOrder: 7, color: '#A78BFA' },
  { name: '旅行', description: '旅行好物（日本必买等）', icon: 'plane', sortOrder: 8, color: '#38BDF8' },
];

async function main() {
  console.log('Seeding database...');

  // 创建分类
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        color: category.color,
      },
      create: category,
    });
  }
  console.log(`Created ${categories.length} categories`);

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'blogger@tiermate.com' },
    update: {},
    create: {
      email: 'blogger@tiermate.com',
      password: hashedPassword,
      name: '好物分享达人',
      avatar: 'https://i.pravatar.cc/150?u=blogger',
      bio: '分享生活中的美好好物，专注于日本好物推荐和居家生活品质提升 ✨',
    },
  });
  console.log(`Created test user: ${testUser.email}`);

  // 获取分类
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map(c => [c.name, c.id]));

  // 创建测试产品
  const products = [
    {
      title: 'Apple AirPods Pro 2 真无线降噪耳机',
      description: '主动降噪，自适应透明模式，空间音频，MagSafe 充电盒',
      content: `## 为什么推荐

使用 AirPods Pro 2 已经一年了，今天来分享一下真实使用体验。

### 降噪效果
降噪效果真的很出色，在地铁上基本可以隔绝大部分噪音。自适应透明模式也很实用。

### 音质表现
音质方面中规中矩，对于日常听歌来说完全够用。空间音频功能在看电影的时候体验很棒。

### 续航体验
续航方面单次可以用4-5小时，配合充电盒用一天完全没问题。

## 总结
如果你是苹果全家桶用户，AirPods Pro 2 绝对是最佳选择。`,
      price: 1899,
      purchaseUrl: 'https://www.apple.com.cn/shop/product/MQD83CH/A',
      images: ['https://picsum.photos/seed/airpods1/800/600', 'https://picsum.photos/seed/airpods2/800/600'],
      tags: ['数码', '耳机', 'Apple', '降噪'],
      categoryId: categoryMap.get('卧室'),
    },
    {
      title: '戴森 V15 Detect 无绳吸尘器',
      description: '激光探测微尘，智能感应调节吸力，HEPA 过滤系统',
      content: `## 开箱体验

收到戴森 V15 的第一感觉就是——真的很重！但上手使用后发现重心设计很合理。

### 激光探测
这个功能真的太酷了，可以清晰看到地板上的灰尘和微粒。

### 吸力表现
自动调节吸力非常智能，遇到脏的地方会自动加大功率。

### 续航
续航 60 分钟足够打扫整个房子了。

## 购买建议
虽然价格不便宜，但作为居家清洁神器，强烈推荐！`,
      price: 5490,
      purchaseUrl: 'https://www.dyson.cn',
      images: ['https://picsum.photos/seed/dyson1/800/600', 'https://picsum.photos/seed/dyson2/800/600'],
      tags: ['家电', '吸尘器', '戴森', '清洁'],
      categoryId: categoryMap.get('住'),
    },
    {
      title: '日本 MUJI 无印良品 敏感肌水乳套装',
      description: '温和配方，适合敏感肌使用，补水保湿效果好',
      content: `## 敏感肌福音

作为一个敏感肌，找到适合自己的护肤品真的太难了。这款 MUJI 水乳套装用了半年，真心推荐！

### 成分分析
无香精、无酒精、无色素，成分表非常干净。

### 使用感受
质地清爽，吸收快，不会闷痘。

### 性价比
价格亲民，量大管够！

## 总结
敏感肌入门护肤首选，回购无数次了。`,
      price: 158,
      purchaseUrl: 'https://www.muji.com.cn',
      images: ['https://picsum.photos/seed/muji1/800/600'],
      tags: ['护肤', '敏感肌', '日本', 'MUJI'],
      categoryId: categoryMap.get('化妆品'),
    },
    {
      title: '日本龙角散润喉糖',
      description: '日本旅行必买！清凉润喉，缓解喉咙不适',
      content: `## 日本药妆店必买

每次去日本必囤的好物！龙角散润喉糖真的太好用了。

### 口味选择
推荐薄荷味和蜂蜜柠檬味，都很好吃。

### 效果
喉咙不舒服的时候含一颗，马上就舒服很多。

### 购买建议
在日本药妆店很便宜，多囤几盒！

## 总结
去日本旅行的朋友一定要买！`,
      price: 38,
      purchaseUrl: 'https://item.jd.com/100012345.html',
      images: ['https://picsum.photos/seed/ryukaku/800/600'],
      tags: ['日本', '旅行', '药妆', '润喉糖'],
      categoryId: categoryMap.get('旅行'),
    },
    {
      title: '摩飞便携式榨汁杯',
      description: '随身携带，一键榨汁，USB充电，果汁随时喝',
      content: `## 上班族神器

作为一个上班族，早上没时间做早餐，这款榨汁杯真的救了我！

### 便携性
小巧轻便，放在包里毫无压力。

### 使用体验
30秒就能榨一杯果汁，清洗也很方便。

### 续航
充一次电可以用好几天。

## 总结
适合追求健康生活的上班族！`,
      price: 199,
      purchaseUrl: 'https://item.jd.com/100056789.html',
      images: ['https://picsum.photos/seed/morphy/800/600'],
      tags: ['厨房', '榨汁机', '便携', '健康'],
      categoryId: categoryMap.get('厨房'),
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        authorId: testUser.id,
      },
    });
  }
  console.log(`Created ${products.length} test products`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
