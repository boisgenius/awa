'use client';

import Link from 'next/link';

interface AnnouncementBarProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
}

export function AnnouncementBar({
  message = '🚀 Build skills for AI agents —',
  linkText = 'Get early access to our developer platform →',
  linkHref = '/developers',
}: AnnouncementBarProps) {
  return (
    <div className="bg-gradient-to-r from-[#E84A3E] to-[#FF6B5B] py-3 px-5 text-center text-sm font-medium text-white">
      {message}{' '}
      <Link href={linkHref} className="underline hover:no-underline">
        {linkText}
      </Link>
    </div>
  );
}
