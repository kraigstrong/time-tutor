import React from 'react';

import { pageStyles } from './pageStyles';

export function SupportPage() {
  return (
    <main style={pageStyles.body}>
      <section style={pageStyles.card}>
        <h1 style={pageStyles.title}>Time Tutor Support</h1>

        <h2 style={pageStyles.sectionTitle}>About Time Tutor</h2>
        <p style={pageStyles.paragraphWide}>
          Time Tutor helps children practice reading analog and digital time with
          simple, hands-on activities.
        </p>

        <h2 style={pageStyles.sectionTitle}>Need help?</h2>
        <p style={pageStyles.leadParagraph}>
          For support, bug reports, or feature requests, email:{' '}
          <a href="mailto:support@timetutor.app" style={pageStyles.link}>
            support@timetutor.app
          </a>
        </p>

        <h2 style={pageStyles.sectionTitle}>Frequently Asked Questions</h2>
        <div style={pageStyles.sectionStack}>
          <FaqItem
            answer="Time Tutor is designed for kids, parents, and teachers who want simple practice with analog and digital clocks."
            question="Who is Time Tutor for?"
          />
          <FaqItem
            answer="No. Time Tutor does not require an account."
            question="Do I need an account?"
          />
          <FaqItem
            answer={
              <>
                See our <a href="/privacy" style={pageStyles.link}>Privacy Policy</a> for details.
              </>
            }
            question="Does Time Tutor collect personal information?"
          />
          <FaqItem
            answer={
              <>
                Send us an email at{' '}
                <a href="mailto:support@timetutor.app" style={pageStyles.link}>
                  support@timetutor.app
                </a>
                .
              </>
            }
            question="How do I report a bug or suggest a feature?"
          />
        </div>
      </section>
    </main>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <section style={pageStyles.faqItem}>
      <p style={pageStyles.itemTitle}>{question}</p>
      <p style={pageStyles.itemBody}>{answer}</p>
    </section>
  );
}
