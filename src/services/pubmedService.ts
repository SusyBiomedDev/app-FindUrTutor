import { XMLParser } from 'fast-xml-parser';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const LOCAIS_ALVO = [
  'United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Northern Ireland',
  'Ireland', 'Sweden', 'Swedish', 'Norway', 'Norwegian', 'Denmark', 'Danish',
  'Finland', 'Finnish', 'Iceland', 'Icelandic', 'France', 'French',
  'Portugal', 'Portuguese', 'Spain', 'Spanish', 'Italy', 'Italian',
  'Netherlands', 'Dutch', 'Belgium', 'Belgian', 'Switzerland', 'Swiss',
  'Austria', 'Austrian', 'Germany', 'German', 'Greece', 'Greek',
  'Cyprus', 'Cypriot', 'Luxembourg', 'Luxembourgish', 'Liechtenstein', 'Liechtensteiner',
];

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['PubmedArticle', 'Author', 'AffiliationInfo', 'ArticleId', 'ELocationID'].includes(name),
  textNodeName: '#text',
});

export async function procurarPubmed(
  keyword: string,
  maxResultados = 100,
  userEmail = 'noemail@example.com',
  retstart = 0,
): Promise<{ ids: string[]; total: number }> {
  if (!keyword?.trim()) return { ids: [], total: 0 };
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 10;
  const searchTerm = `${keyword} AND ${minYear}:${currentYear}[Publication Date]`;

  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=${maxResultados}&retstart=${retstart}&retmode=json&email=${encodeURIComponent(userEmail)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed search failed: ${response.status}`);

  const data = await response.json();
  return {
    ids: data?.esearchresult?.idlist || [],
    total: parseInt(data?.esearchresult?.count || '0', 10),
  };
}

export async function extrairCorrespondingAuthors(idList: string[], lote = 100, userEmail = 'noemail@example.com', locationFilter?: string) {
  const resultados: Array<{
    id: string;
    Nome: string;
    Email: string;
    Título: string;
    Afiliacao: string;
    DOI?: string;
    PMID?: string;
  }> = [];
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
      const articles: any[] = parsed?.PubmedArticleSet?.PubmedArticle || [];

      for (const article of articles) {
        const medlineCitation = article?.MedlineCitation;
        if (!medlineCitation) continue;

        const pmidRaw = medlineCitation?.PMID;
        const pmid = typeof pmidRaw === 'object' ? String(pmidRaw?.['#text'] || '') : String(pmidRaw || '');

        const articleData = medlineCitation?.Article;
        if (!articleData) continue;

        const titleRaw = articleData?.ArticleTitle;
        const title = typeof titleRaw === 'object' ? String(titleRaw?.['#text'] || '') : String(titleRaw || '');

        const articleIds: any[] = article?.PubmedData?.ArticleIdList?.ArticleId || [];
        const doiEntry = articleIds.find((id: any) => id?.['@_IdType'] === 'doi');
        const doi = doiEntry ? (typeof doiEntry === 'object' ? String(doiEntry?.['#text'] || '') : String(doiEntry)) : undefined;

        const authors: any[] = articleData?.AuthorList?.Author || [];

        for (const author of authors) {
          const firstName = author?.ForeName || '';
          const lastName = author?.LastName || '';
          const authorName = [firstName, lastName].filter(Boolean).join(' ').trim();
          if (!authorName) continue;

          const affiliationInfos: any[] = author?.AffiliationInfo || [];

          for (const affInfo of affiliationInfos) {
            const affiliationRaw = affInfo?.Affiliation;
            const affiliation = typeof affiliationRaw === 'object'
              ? String(affiliationRaw?.['#text'] || '')
              : String(affiliationRaw || '');

            if (!affiliation) continue;

            const filterTerms = locationFilter?.trim() ? [locationFilter.trim()] : LOCAIS_ALVO;
            const hasCountry = filterTerms.some(pais =>
              affiliation.toLowerCase().includes(pais.toLowerCase())
            );
            if (!hasCountry) continue;

            const emailMatches = affiliation.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g) || [];
            const validEmails = emailMatches.filter(e => emailRegex.test(e));
            if (validEmails.length === 0) continue;

            const email = validEmails[0];
            if (seenEmails.has(email)) continue;
            seenEmails.add(email);

            resultados.push({
              id: email,
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
      console.warn(`Erro no lote ${Math.floor(i / lote) + 1}:`, err?.message);
    }

    if (i + lote < idList.length) {
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }
  }

  return resultados;
}
