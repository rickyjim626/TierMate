'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  likes: number;
  comments: number;
  author: {
    name: string;
    avatar: string;
  };
}

export function ProductCard({
  id,
  title,
  description,
  imageUrl,
  price,
  likes,
  comments,
  author,
}: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="group">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {description}
          </p>

          {price && (
            <p className="mt-2 text-lg font-bold text-primary-600">
              ¥{price.toFixed(2)}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={author.avatar}
                alt={author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600">{author.name}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1 text-sm">
                <Heart className="w-4 h-4" />
                {likes}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <MessageCircle className="w-4 h-4" />
                {comments}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
