/* 
 React hook to set an observer on document.body to determine if a scrollbar is present.

 Taken from Max Schmitt: 
 https://maxschmitt.me/posts/react-prevent-layout-shift-body-scrollable
 */

import { useState, useEffect } from "react";

export default function useBodyScrollable() {
  const [bodyScrollable, setBodyScrollable] = useState(
    document.body.scrollHeight > window.innerHeight
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setBodyScrollable(document.body.scrollHeight > window.innerHeight);
    });
    resizeObserver.observe(document.body);
    return () => {
      resizeObserver.unobserve(document.body);
    };
  }, []);

  return bodyScrollable;
}
