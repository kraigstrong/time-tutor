import type { CSSProperties } from 'react';

export const pageStyles = {
  body: {
    margin: '0 auto',
    maxWidth: 760,
    padding: '56px 20px 72px',
  } satisfies CSSProperties,
  card: {
    background: '#fffaf2',
    border: '1px solid #eadfce',
    borderRadius: 32,
    boxShadow: '0 18px 42px rgba(25, 52, 84, 0.08)',
    color: '#173f73',
    padding: '32px 24px',
  } satisfies CSSProperties,
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    lineHeight: 1.05,
    margin: 0,
  } satisfies CSSProperties,
  sectionTitle: {
    fontSize: '1.2rem',
    margin: '32px 0 0',
  } satisfies CSSProperties,
  paragraph: {
    color: '#5f738e',
    fontSize: '1rem',
    lineHeight: 1.6,
    marginTop: 14,
  } satisfies CSSProperties,
  paragraphWide: {
    color: '#5f738e',
    fontSize: '1rem',
    lineHeight: 1.6,
    marginTop: 14,
    maxWidth: '54ch',
  } satisfies CSSProperties,
  leadParagraph: {
    color: '#5f738e',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    marginTop: 14,
  } satisfies CSSProperties,
  sectionStack: {
    display: 'grid',
    gap: 18,
    marginTop: 18,
  } satisfies CSSProperties,
  faqItem: {
    borderTop: '1px solid #eadfce',
    paddingTop: 18,
  } satisfies CSSProperties,
  itemTitle: {
    color: '#173f73',
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 0 6px',
  } satisfies CSSProperties,
  itemBody: {
    color: '#5f738e',
    fontSize: '1rem',
    lineHeight: 1.6,
    margin: 0,
  } satisfies CSSProperties,
  link: {
    color: '#ef7a5a',
    fontWeight: 700,
    textDecoration: 'none',
  } satisfies CSSProperties,
  updatedAt: {
    color: '#5f738e',
    fontSize: '0.98rem',
    lineHeight: 1.5,
    margin: '18px 0 0',
  } satisfies CSSProperties,
} as const;
