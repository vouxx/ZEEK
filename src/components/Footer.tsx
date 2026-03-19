export function Footer() {
  return (
    <footer className="border-t border-neutral-100 dark:border-neutral-800 py-4">
      <div className="px-6 text-center text-xs text-neutral-300 dark:text-neutral-600">
        <p>&copy; {new Date().getFullYear()} zei · v1.1.0</p>
      </div>
    </footer>
  );
}
