import { cn } from '@/lib/utils';

export default function ContainerLayout({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('flex flex-1 flex-col pt-6')}>
            <div className={cn('mx-2 px-2 sm:mx-6', className)}>{children}</div>
        </div>
    );
}
