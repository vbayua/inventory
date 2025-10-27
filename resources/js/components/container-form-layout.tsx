export default function ContainerFormLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg mt-12 shadow-md p-6 w-full max-w-4xl mx-auto">
            {children}
        </div>
    );
}
