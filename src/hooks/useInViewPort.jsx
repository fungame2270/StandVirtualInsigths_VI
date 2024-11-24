import { useEffect, useState } from "react";

function useIsInViewport(ref) {
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting); // Checks if the element is visible in the viewport
            },
            { threshold: 0 } // 0 means even a pixel of visibility counts
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref]);

    return isInViewport;
}

export default useIsInViewport;