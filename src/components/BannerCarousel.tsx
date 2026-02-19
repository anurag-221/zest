'use client';

import { AppEvent } from '../types';
import Link from 'next/link';

interface BannerCarouselProps {
  events: AppEvent[];
}

export default function BannerCarousel({ events }: BannerCarouselProps) {
  if (events.length === 0) return null;

  return (
    <div className="w-full my-6 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col gap-6">
        {/* Simple single banner for now, can be made into a carousel later */}
        {events.map((event) => (
            <div 
                key={event.id}
                className="relative w-full h-[200px] md:h-[280px] rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] duration-300"
                style={{ backgroundColor: event.assets.themeColor }}
            >
                {/* Fallback layout if image fails or for text overlay */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white z-10 bg-gradient-to-r from-black/40 to-transparent">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 w-fit border border-white/30">
                        {event.type.toUpperCase()}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-md">{event.name}</h2>
                    <p className="text-lg opacity-90 mb-6 max-w-md">Limited time offers on specific items.</p>
                    <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold w-fit hover:bg-gray-100 transition-colors shadow-lg">
                        View Offers
                    </button>
                </div>
                {/* Actual Image */}
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={event.assets.banner} 
                    alt={event.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        ))}
      </div>
    </div>
  );
}
