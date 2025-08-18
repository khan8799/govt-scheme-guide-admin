import React from "react";
import Link from "next/link";
import { DocsIcon, FolderIcon, ChatIcon, UserCircleIcon } from "@/icons";

export default function AdminDashboard() {
  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-50 to-white p-8 dark:border-gray-800 dark:from-white/[0.03] dark:to-transparent md:p-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90 sm:text-4xl">
            Government Schemes Guide — Admin Panel
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
            Manage and publish government schemes across states, organize categories, and
            moderate citizen discussions — all in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/scheme"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              <DocsIcon />
              Go to Schemes
            </Link>
            <Link
              href="/category"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <FolderIcon />
              Manage Categories
            </Link>
          </div>
        </div>

        {/* Accent blob */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Published Schemes", value: "—" },
          { label: "Categories", value: "—" },
          { label: "Open Discussions", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FeatureCard
          icon={<DocsIcon />}
          title="Add & Edit Schemes"
          text="Create detailed scheme pages with eligibility, benefits, documents, and timelines."
        />
        <FeatureCard
          icon={<FolderIcon />}
          title="Organize by Category & State"
          text="Keep content structured for quick discovery and state-specific browsing."
        />
        <FeatureCard
          icon={<ChatIcon />}
          title="Moderate Discussions"
          text="Enable comments, review feedback, and keep conversations constructive."
        />
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-gray-200 bg-white p-7 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">
          Ready to publish your next scheme?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Use the buttons below to jump straight into managing content.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/scheme"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
          >
            <DocsIcon />
            Create Scheme
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <UserCircleIcon />
            View Profile
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}

