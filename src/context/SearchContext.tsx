import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Tutor, TutorPin } from '../types/tutor';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

// Exportação retrocompatível, permite que código antigo continue a usar "ResultItem".
export type { Tutor as ResultItem };

//types

type SearchParams = {
  keyword:  string;
  email:    string;
  location: string;
};

type SearchContextType = {
  params: SearchParams;
  data: Tutor[];          // resultados acumulados de todas as páginas carregadas
  loading: boolean;          // verdadeiro durante a pesquisa inicial
  loadingMore: boolean;          // verdadeiro durante o carregamento de mais resultados
  error: string | null;
  hasSearched: boolean;          // distingue "nunca pesquisou" de "pesquisa sem resultados"
  runSearch: (p: SearchParams) => void;
  loadMore: () => void;       // chamado pelo scroll infinito do TableScreen
  clearSearch: () => void;
  focusedPin: TutorPin | null; // pin a centrar no mapa quando se navega a partir do CardItem
  setFocusedPin: (pin: TutorPin | null) => void;
};

// default

const EMPTY_PARAMS: SearchParams = { keyword: '', email: '', location: '' };


const SearchContext = createContext<SearchContextType>({
  params: EMPTY_PARAMS,
  data: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasSearched: false,
  runSearch: () => {},
  loadMore: () => {},
  clearSearch: () => {},
  focusedPin: null,
  setFocusedPin: () => {},
});

// Número de artigos pedidos ao PubMed por chamada (máx. permitido pela API é 10 000).
const PUBMED_FETCH_SIZE = 100;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SearchProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<SearchParams>(EMPTY_PARAMS);
  const [data, setData] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedPin,  setFocusedPin]  = useState<TutorPin | null>(null);

  // Refs são usadas para controlar paginação sem causar re-renders desnecessários.
  const pubmedOffset = useRef(0);   // quantos artigos já foram pedidos
  const pubmedTotal = useRef(0);   // total de artigos disponíveis na query
  const isFetching = useRef(false); // guarda contra chamadas simultâneas em loadMore
  const currentKw = useRef('');  // keyword ativa (necessária em loadMore sem re-render)

  // Normaliza a resposta crua da API para o tipo Tutor interno da aplicação.
  const mapResults = (results: any[]): Tutor[] =>
    results.map(item => ({
      id: item.id,
      nome: item.Nome,
      area: item.Título,
      email:item.Email,
      afiliacao: item.Afiliacao,
      doi: item.DOI,
      pmid:item.PMID,
    }));

  // ── runSearch ─────────────────────────────────────────────────────────────
  // Inicia uma nova pesquisa: limpa estado anterior e vai buscar a primeira
  // página de resultados com autores correspondentes válidos.
  // Usa um loop para avançar pelos offsets do PubMed até encontrar resultados
  // com email (a API devolve muitos artigos sem corresponding author).
  const runSearch = (p: SearchParams) => {
    if (!p.keyword.trim()) return;

    setParams(p);
    setData([]);
    setError(null);
    setLoading(true);
    setHasSearched(true);
    pubmedOffset.current = 0;
    pubmedTotal.current = 0;
    isFetching.current = false;
    currentKw.current = p.keyword.trim();

    // Flag local para cancelar atualizações de estado se o componente desmontar
    // ou se o utilizador iniciar uma nova pesquisa antes desta terminar.
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
          total = t;
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

  // ── loadMore ──────────────────────────────────────────────────────────────
  // Chamado quando o utilizador faz scroll até ao fim da lista no TableScreen.
  // Guarda contra chamadas simultâneas com "isFetching".
  const loadMore = async () => {
    if (!currentKw.current) return;
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
          // Acumula os novos resultados ao array existente (scroll infinito).
          setData(prev => [...prev, ...mapResults(results)]);
          break;
        }
      }
    } catch (err: any) {
      console.warn('loadMore error:', err?.message);
    } finally {
      // "finally" garante que os flags de loading são sempre limpos, mesmo com erro.
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  // ── clearSearch ───────────────────────────────────────────────────────────
  // Repõe o contexto ao estado inicial (usado se o utilizador quiser recomeçar).
  const clearSearch = () => {
    setParams(EMPTY_PARAMS);
    setData([]);
    setError(null);
    setHasSearched(false);
    pubmedOffset.current = 0;
    pubmedTotal.current = 0;
    currentKw.current = '';
    setFocusedPin(null);
  };

  return (
    <SearchContext.Provider
      value={{ params, data, loading, loadingMore, error, hasSearched,
               runSearch, loadMore, clearSearch, focusedPin, setFocusedPin }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// Hook personalizado — encapsula o useContext para simplificar o consumo.
export function useSearch() {
  return useContext(SearchContext);
}
