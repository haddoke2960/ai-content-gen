import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#777' }}>
      <Link href="/privacy-policy">
        <a style={{ textDecoration: 'underline' }}>Privacy Policy</a>
      </Link>
    </footer>
  );
}