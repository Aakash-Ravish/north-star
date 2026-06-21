'use client';

import Link from 'next/link';
import PipPenguin from '@/components/PipPenguin';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Sad Pip */}
        <div className="mb-8">
          <PipPenguin
            size="xl"
            mood="sad"
            className="mx-auto"
          />
        </div>

        {/* 404 Message */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Even penguins get lost sometimes! It looks like the page you're looking for wandered off into the ice.
          Let's get you back to safety with Pip! 🐧
        </p>

        {/* Navigation Options */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block btn-primary w-full sm:w-auto px-6 py-3"
          >
            🏠 Return Home
          </Link>

          <div className="text-sm text-gray-500">
            Or try one of these:
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              💬 Chat with Pip
            </Link>

            <Link
              href="/journal"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              📊 View Journal
            </Link>

            <Link
              href="/onboarding"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              ✨ Start Fresh
            </Link>
          </div>
        </div>

        {/* Fun penguin fact */}
        <div className="mt-12 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">🐧 Penguin Fact:</span> Penguins can't actually get lost in the Antarctic because they have excellent navigation skills! Unlike this webpage... 😅
          </p>
        </div>
      </div>
    </div>
  );
}