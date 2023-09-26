import { useState, useEffect, useRef } from 'react';

interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
  error: string;
}

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  url: string;
  created: string;
}

function useAbortableFetch() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);

  const abortControllerRef = useRef(new AbortController());

  const abortRequest = () => {
    abortControllerRef.current.abort();
    // Genera un nuevo AbortController para futuras solicitudes.
    abortControllerRef.current = new AbortController();
  };

  const fetchData = async () => {
    if (!url) return;

    setIsLoading(true);
    setError(null);
    abortRequest(); // Cancela la solicitud anterior si existe.
    const { signal } = abortControllerRef.current;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
      if (!signal.aborted) {
        if (response.ok) {
          const result: ApiResponse = await response.json();
          setData(result);
        }else{
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unknown error occurred.'));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, error, isLoading, setUrl };
}

export default useAbortableFetch;
