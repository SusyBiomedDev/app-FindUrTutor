import { XMLParser } from 'fast-xml-parser';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Lista de países/regiões europeus usada como filtro padrão quando o utilizador
// não especifica um país. Inclui variantes (ex: "UK" e "United Kingdom").

const LOCAIS_ALVO = [
  'United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Northern Ireland',
  'Ireland', 'Sweden', 'Swedish', 'Norway', 'Norwegian', 'Denmark', 'Danish',
  'Finland', 'Finnish', 'Iceland', 'Icelandic', 'France', 'French',
  'Portugal', 'Portuguese', 'Spain', 'Spanish', 'Italy', 'Italian',
  'Netherlands', 'Dutch', 'Belgium', 'Belgian', 'Switzerland', 'Swiss',
  'Austria', 'Austrian', 'Germany', 'German', 'Greece', 'Greek',
  'Cyprus', 'Cypriot', 'Luxembourg', 'Luxembourgish', 'Liechtenstein', 'Liechtensteiner',
];

// Regex de validação de email — usada para extrair emails do texto da afiliação.
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Converte entidades HTML em caracteres normais.
// A API PubMed pode devolver títulos com entidades como &#x03B1; (α) ou &amp;.
function decodeHtml(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g,            (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Instância partilhada do parser XML — reutilizar a instância é mais eficiente do que criar uma nova por chamada.
// "isArray" garante que campos que podem ser um objeto OU array são sempre tratados como array.
const xmlParser = new XMLParser({
  ignoreAttributes:    false,
  attributeNamePrefix: '@_',
  isArray: (name) =>
    ['PubmedArticle', 'Author', 'AffiliationInfo', 'ArticleId', 'ELocationID'].includes(name),
  textNodeName: '#text',
});


// procurarPubmed
// Fase 1: E-search, devolve uma lista de PMIDs e o total de resultados
// para a keyword fornecida, filtrada pelos últimos 10 anos.
// "retstart" permite paginação (offset).

export async function procurarPubmed(
  keyword: string,
  maxResultados = 100,
  userEmail = 'noemail@example.com',
  retstart  = 0,
): Promise<{ ids: string[]; total: number }> {
  if (!keyword?.trim()) return { ids: [], total: 0 };

  // Limita a pesquisa aos últimos 10 anos para relevância.
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 10;
  const searchTerm = `${keyword} AND ${minYear}:${currentYear}[Publication Date]`;

  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=${maxResultados}&retstart=${retstart}&retmode=json&email=${encodeURIComponent(userEmail)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed search failed: ${response.status}`);

  const data = await response.json();
  return {
    ids:   data?.esearchresult?.idlist || [],
    total: parseInt(data?.esearchresult?.count || '0', 10),
  };
}


// extrairCorrespondingAuthors
// Fase 2: E-fetch, obtém o XML completo dos artigos e extrai os autores
// correspondentes (autores com email na afiliação que corresponde ao país filtro).
// Processa os IDs em lotes para respeitar os limites da API.
// "seenEmails" evita duplicados entre lotes.

export async function extrairCorrespondingAuthors(
  idList: string[],
  lote = 100,
  userEmail = 'noemail@example.com',
  locationFilter?: string,
) {
  const resultados: Array<{
    id: string; Nome: string; Email: string;
    Título: string; Afiliacao: string; DOI?: string; PMID?: string;
  }> = [];

  // Set para desduplicar por email, um investigador pode aparecer em vários artigos.
  const seenEmails = new Set<string>();

  if (!idList || idList.length === 0) return resultados;

  for (let i = 0; i < idList.length; i += lote) {
    const subset = idList.slice(i, i + lote).join(',');
    const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${encodeURIComponent(subset)}&rettype=xml&retmode=xml&email=${encodeURIComponent(userEmail)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const xml = await response.text();
      const parsed = xmlParser.parse(xml);

      // O PubmedArticleSet pode ter um ou vários PubmedArticle.
      const articles: any[] = parsed?.PubmedArticleSet?.PubmedArticle || [];

      for (const article of articles) {
        const medlineCitation = article?.MedlineCitation;
        if (!medlineCitation) continue;

        // PMID pode ser objeto (com atributo de versão) ou string simples.
        const pmidRaw = medlineCitation?.PMID;
        const pmid    = typeof pmidRaw === 'object'
          ? String(pmidRaw?.['#text'] || '')
          : String(pmidRaw || '');

        const articleData = medlineCitation?.Article;
        if (!articleData) continue;

        // Título do artigo — descodifica entidades HTML.
        const titleRaw = articleData?.ArticleTitle;
        const title    = decodeHtml(
          typeof titleRaw === 'object'
            ? String(titleRaw?.['#text'] || '')
            : String(titleRaw || ''),
        );

        // Extrai o DOI da lista de identificadores do artigo.
        const articleIds: any[] = article?.PubmedData?.ArticleIdList?.ArticleId || [];
        const doiEntry = articleIds.find((id: any) => id?.['@_IdType'] === 'doi');
        const doi = doiEntry
          ? (typeof doiEntry === 'object' ? String(doiEntry?.['#text'] || '') : String(doiEntry))
          : undefined;

        const authors: any[] = articleData?.AuthorList?.Author || [];

        for (const author of authors) {
          const firstName = decodeHtml(String(author?.ForeName || ''));
          const lastName = decodeHtml(String(author?.LastName  || ''));
          const authorName = [firstName, lastName].filter(Boolean).join(' ').trim();
          if (!authorName) continue;

          const affiliationInfos: any[] = author?.AffiliationInfo || [];

          for (const affInfo of affiliationInfos) {
            const affiliationRaw = affInfo?.Affiliation;
            const affiliation = typeof affiliationRaw === 'object'
              ? String(affiliationRaw?.['#text'] || '')
              : String(affiliationRaw || '');

            if (!affiliation) continue;

            // Filtro geográfico: usa o país do utilizador ou a lista europeia por omissão.
            const filterTerms = locationFilter?.trim()
              ? [locationFilter.trim()]
              : LOCAIS_ALVO;
            const hasCountry = filterTerms.some(pais =>
              affiliation.toLowerCase().includes(pais.toLowerCase()),
            );
            if (!hasCountry) continue;

            // Extrai emails do texto da afiliação com regex.
            const emailMatches = affiliation.match(
              /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g,
            ) || [];
            const validEmails = emailMatches.filter(e => emailRegex.test(e));
            if (validEmails.length === 0) continue; // sem email → não é "corresponding author"

            const email = validEmails[0];
            if (seenEmails.has(email)) continue; // ignora duplicados
            seenEmails.add(email);

            resultados.push({
              id: email, // o email é usado como ID único
              Nome: authorName,
              Email: email,
              Título: title,
              Afiliacao: affiliation,
              DOI: doi || undefined,
              PMID: pmid || undefined,
            });
          }
        }
      }
    } catch (err: any) {
      // Erros num lote não interrompem os restantes.
      console.warn(`Erro no lote ${Math.floor(i / lote) + 1}:`, err?.message);
    }

    // Pausa de 1 segundo entre lotes para respeitar o rate limit da API PubMed (3 req/s sem chave).
    if (i + lote < idList.length) {
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }
  }

  return resultados;
}
