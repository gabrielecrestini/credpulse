// src/components/layout/footer.tsx
export default function Footer() {
    return (
        <footer className="w-full mt-24 py-6 px-8 text-center text-gray-500 border-t border-white/10">
            <p>&copy; {new Date().getFullYear()} CredPulse. Tutti i diritti riservati.</p>
            <p className="text-xs mt-2">Un nuovo modo di guadagnare dal futuro della finanza.</p>
        </footer>
    );
}