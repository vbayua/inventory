import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const trimSlashes = (path: string) => path.replace(/^\/+|\/+$/g, '');

/**
 * Whether the current route URI or URL path falls under a navigation item's URI.
 *
 * Matches whole path segments, so `stocks/{stock}` is under `stocks`,
 * but `product-types` is not under `products`. Query strings are ignored.
 */
export function isUriActive(currentUri: string | null | undefined, navUri: string | null | undefined): boolean {
    if (!currentUri || !navUri) {
        return false;
    }

    const current = trimSlashes(currentUri.split('?')[0]);
    const target = trimSlashes(navUri);

    return target !== '' && (current === target || current.startsWith(`${target}/`));
}
