import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Database, Mail, FileText, UserCheck } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust, Security & Privacy — Rybus" },
      {
        name: "description",
        content:
          "How Rybus handles your data — security controls, hosting, privacy practices and how to contact us about your information.",
      },
      { property: "og:title", content: "Trust, Security & Privacy — Rybus" },
      {
        property: "og:description",
        content:
          "How Rybus handles your data — security controls, hosting, privacy practices and how to contact us.",
      },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-xl font-bold text-foreground">
            Rybus
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-10 flex items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Trust, Security &amp; Privacy
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This page is maintained by Rybus (Pty) Ltd to answer common security and
              privacy questions about the Rybus website. It describes practices in plain
              language and is not an independent certification or audit.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-foreground">
          <Section icon={<UserCheck className="h-5 w-5" />} title="What we collect">
            <p>
              When you request a quote through our website, we ask for your name, phone
              number, email address and, optionally, your service address and a short
              message describing what you need. We use this information only to respond
              to your enquiry and to schedule any follow-up service.
            </p>
            <p>
              We also keep basic anonymous visit logs (page visited, approximate time,
              referring page) to understand which information visitors find useful. These
              logs do not include your name or contact details.
            </p>
          </Section>

          <Section icon={<Lock className="h-5 w-5" />} title="Access &amp; authentication">
            <p>
              The customer-facing site is public. The admin area used by Rybus staff sits
              behind email-and-password sign-in, and only the Rybus admin account can
              view quote requests, customer records and gallery management tools.
              Role-based access rules are enforced on the database itself, not only in
              the browser.
            </p>
          </Section>

          <Section icon={<Database className="h-5 w-5" />} title="Hosting &amp; data location">
            <p>
              The website and its database run on Lovable Cloud (built on Supabase) with
              row-level security enabled on every customer-data table. Backups are
              managed continuously by the hosting provider. We do not run our own
              servers.
            </p>
            <p>
              Lovable Cloud and Supabase are independent providers; this page describes
              Rybus&apos;s own practices and is not an endorsement of, or certification
              by, those providers.
            </p>
          </Section>

          <Section icon={<FileText className="h-5 w-5" />} title="Retention &amp; deletion">
            <p>
              Quote requests are kept while they are active and for a reasonable period
              afterwards so we can answer follow-up questions or complete warranty work.
              If you&apos;d like a copy of the information we hold about you, or want it
              deleted, contact us using the details below and we&apos;ll action your
              request.
            </p>
          </Section>

          <Section icon={<Mail className="h-5 w-5" />} title="Security &amp; privacy contact">
            <p>
              For security reports, privacy questions, or data-access / deletion
              requests, email{" "}
              <a className="text-primary underline" href="mailto:info@rybus.co.za">
                info@rybus.co.za
              </a>{" "}
              or call <span className="font-semibold">082 232 0386</span>.
            </p>
          </Section>

          <p className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
            This page is editable content owned by Rybus. It is not a regulatory
            certification (e.g. POPIA, GDPR, SOC 2, ISO) and does not constitute a legal
            guarantee. We update it as our practices change.
          </p>
        </div>
      </section>
    </main>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <span className="text-primary">{icon}</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
