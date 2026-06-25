import { useEffect, useRef, useState } from 'react';

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setState(s => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then(data => { if (mounted.current) setState({ data, error: null, loading: false }); })
      .catch(error => { if (mounted.current) setState({ data: null, error, loading: false }); });
    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
