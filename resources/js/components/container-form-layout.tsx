export default function ContainerFormLayout({ children }: { children: React.ReactNode }) {
    return <div className="mx-auto mt-6 w-full max-w-5xl rounded-lg border p-6 shadow-lg md:p-12">{children}</div>;
}
