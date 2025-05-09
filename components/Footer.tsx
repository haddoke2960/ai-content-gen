import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#777' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <Link href="/privacy-policy">
          <a style={{ textDecoration: 'underline' }}>Privacy Policy</a>
        </Link>
        <Link href="/terms">
          <a style={{ textDecoration: 'underline' }}>Terms of Use</a>
        </Link>
      </div>
    </footer>
  );
}