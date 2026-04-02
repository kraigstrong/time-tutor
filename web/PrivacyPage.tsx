import React from 'react';

import { pageStyles } from './pageStyles';

export function PrivacyPage() {
  return (
    <main style={pageStyles.body}>
      <section style={pageStyles.card}>
        <h1 style={pageStyles.title}>Privacy Policy</h1>
        <p style={pageStyles.updatedAt}>
          <strong>Last updated:</strong> April 2, 2026
        </p>

        <p style={pageStyles.leadParagraph}>Time Tutor respects your privacy.</p>
        <p style={pageStyles.paragraphWide}>
          This Privacy Policy explains how Time Tutor handles information when you
          use our website, web app, and related applications.
        </p>

        <h2 style={pageStyles.sectionTitle}>Information We Collect</h2>
        <p style={pageStyles.paragraphWide}>
          Time Tutor does not require an account, and we do not collect personal
          information through the app.
        </p>
        <p style={pageStyles.paragraphWide}>
          The app may store basic settings or progress locally on your device or in
          your browser so it can function properly.
        </p>
        <p style={pageStyles.paragraphWide}>
          If you contact us for support, we may receive the information you choose
          to include in your email and use it only to respond to your message.
        </p>

        <h2 style={pageStyles.sectionTitle}>Children&apos;s Privacy</h2>
        <p style={pageStyles.paragraphWide}>
          Time Tutor is designed for children, parents, and teachers as an
          educational tool for learning to read analog and digital clocks.
        </p>
        <p style={pageStyles.paragraphWide}>
          We do not knowingly collect personal information from children through the
          app.
        </p>
        <p style={pageStyles.paragraphWide}>
          If you believe a child has provided personal information to us, please
          contact us and we will address the issue promptly.
        </p>

        <h2 style={pageStyles.sectionTitle}>Website and Technical Services</h2>
        <p style={pageStyles.paragraphWide}>
          When you use the Time Tutor website or web app, basic technical
          information may be processed by hosting or infrastructure providers as
          part of delivering the site securely.
        </p>

        <h2 style={pageStyles.sectionTitle}>Data Retention</h2>
        <p style={pageStyles.paragraphWide}>
          Because Time Tutor does not require accounts or collect personal
          information through the app, we generally do not retain personal data from
          app usage.
        </p>
        <p style={pageStyles.paragraphWide}>
          If you contact us for support, we may keep that correspondence for as long
          as reasonably necessary to respond to you and maintain support records.
        </p>

        <h2 style={pageStyles.sectionTitle}>Your Choices</h2>
        <p style={pageStyles.paragraphWide}>You can stop using Time Tutor at any time.</p>
        <p style={pageStyles.paragraphWide}>
          For web use, you may be able to clear locally stored settings or data
          through your browser settings.
        </p>
        <p style={pageStyles.paragraphWide}>
          For app use, you may be able to remove locally stored data by deleting the
          app or using your device settings, depending on platform behavior.
        </p>

        <h2 style={pageStyles.sectionTitle}>Changes to This Policy</h2>
        <p style={pageStyles.paragraphWide}>
          We may update this Privacy Policy from time to time. If we make changes,
          we will post the updated version on this page and update the &ldquo;Last
          updated&rdquo; date above.
        </p>

        <h2 style={pageStyles.sectionTitle}>Contact</h2>
        <p style={pageStyles.paragraphWide}>
          If you have questions about this Privacy Policy or need support, contact
          us at:
        </p>
        <p style={pageStyles.leadParagraph}>
          <a href="mailto:support@timetutor.app" style={pageStyles.link}>
            support@timetutor.app
          </a>
        </p>
      </section>
    </main>
  );
}
