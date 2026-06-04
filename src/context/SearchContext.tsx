import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Tutor, TutorPin } from '../types/tutor';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

export type { Tutor as ResultItem }; // retrocompatibilidade

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  keyword:  string;
  email:    string;
  location: string;
};

type SearchContextType = {
  params:      SearchParams;
  data:        Tutor[];
  loading:     boolean;
  loadingMore: boolean;
  error:       string | null;
  hasSearched: boolean;
  runSearch:   (p: SearchParams) => void;
  loadMore:    () => void;
  clearSearch:   () => void;
  focusedPin:    TutorPin | null;
  setFocusedPin: (pin: TutorPin | null) => void;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const EMPTY_PARAMS: SearchParams = { keyword: '', email: '', location: '' };

const SearchContext = createContext<SearchContextType>({
  params:      EMPTY_PARAMS,
  data:        [],
  loading:     false,
  loadingMore: false,
  error:       null,
  hasSearched: false,
  runSearch:   () => {},
  loadMore:    () => {},
  clearSearch:   () => {},
  focusedPin:    null,
  setFocusedPin: () => {},
});

const PUBMED_FETCH_SIZE = 100;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SearchProvider({ children }: { children: ReactNode }) {
  const [params,      setParams]      = useState<SearchParams>(EMPTY_PARAMS);
  const [data,        setData]        = useState<Tutor[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [hasSearched,  setHasSearched]  = useState(false);
  const [focusedPin,   setFocusedPin]   = useState<TutorPin | null>(null);

  const pubmedOffset = useRef(0);
  const pubmedTotal  = useRef(0);
  const isFetching   = useRef(false);
  const currentKw    = useRef('');

  const mapResults = (results: any[]): Tutor[] =>
    results.map(item => ({
      id:        item.id,
      nome:      item.Nome,
      area:      item.Título,
      email:     item.Email,
      afiliacao: item.Afiliacao,
      doi:       item.DOI,
      pmid:      item.PMID,
    }));

  // ── Initial search ─────────────────────────────────────────────────────
  const runSearch = (p: SearchParams) => {
    if (!p.keyword.trim()) return;

    setParams(p);
    setData([]);
    setError(null);
    setLoading(true);
    setHasSearched(true);
    pubmedOffset.current = 0;
    pubmedTotal.current  = 0;
    isFetching.current   = false;
    currentKw.current    = p.keyword.trim();

    let cancelled = false;

    async function loadInitial() {
      let offset = 0;
      let total  = 0;
      let found  = false;

      try {
        while (true) {
          if (cancelled) return;
          if (total > 0 && offset >= total) break;

          const { ids, total: t } = await procurarPubmed(
            p.keyword, PUBMED_FETCH_SIZE, p.email, offset,
          );
          total   = t;
          offset += PUBMED_FETCH_SIZE;

          if (!ids || ids.length === 0) break;

          const results = await extrairCorrespondingAuthors(ids, 100, p.email, p.location);

          if (results && results.length > 0) {
            setData(mapResults(results));
            pubmedOffset.current = offset;
            pubmedTotal.current  = total;
            if (!found) { found = true; setLoading(false); }
            break;
          }

          pubmedOffset.current = offset;
          pubmedTotal.current  = total;
        }

        if (!found && !cancelled) {
          setError('No corresponding authors found.');
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error loading results.');
          setLoading(false);
        }
      }
    }

    loadInitial();
  };

  // ── Load more ──────────────────────────────────────────────────────────
  const loadMore = async () => {
    if (isFetching.current || loadingMore) return;
    if (pubmedOffset.current >= pubmedTotal.current && pubmedTotal.current > 0) return;

    isFetching.current = true;
    setLoadingMore(true);

    let offset = pubmedOffset.current;
    let total  = pubmedTotal.current;

    try {
      while (true) {
        if (total > 0 && offset >= total) break;

        const { ids, total: t } = await procurarPubmed(
          currentKw.current, PUBMED_FETCH_SIZE, params.email, offset,
        );
        total   = t;
        offset += PUBMED_FETCH_SIZE;

        if (!ids || ids.length === 0) break;

        const results = await extrairCorrespondingAuthors(
          ids, 100, params.email, params.location,
        );

        pubmedOffset.current = offset;
        pubmedTotal.current  = total;

        if (results && results.length > 0) {
          setData(prev => [...prev, ...mapResults(results)]);
          break;
        }
      }
    } catch (err: any) {
      console.warn('loadMore error:', err?.message);
    } finally {
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  // ── Clear ──────────────────────────────────────────────────────────────
  const clearSearch = () => {
    setParams(EMPTY_PARAMS);
    setData([]);
    setError(null);
    setHasSearched(false);
    pubmedOffset.current = 0;
    pubmedTotal.current  = 0;
    currentKw.current    = '';
    setFocusedPin(null);
  };

  return (
    <SearchContext.Provider
      value={{ params, data, loading, loadingMore, error, hasSearched, runSearch, loadMore, clearSearch, focusedPin, setFocusedPin }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
