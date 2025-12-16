export default function ContainerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={'flex flex-1 flex-col pt-6'}>
            <div className="mx-6 px-6 sm:mx-2">{children}</div>
        </div>
    );
}
