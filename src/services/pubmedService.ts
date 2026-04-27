const API_URL = 'http://10.0.2.2:3000/api';

const LOCAIS_ALVO = [
  'United Kingdom','UK','England','Scotland','Wales','Northern Ireland',
  'Ireland','Sweden','Swedish','Norway','Norwegian','Denmark','Danish',
  'Finland','Finnish','Iceland','Icelandic','France','French','Portugal','Portuguese','Spain','Spanish','Italy','Italian','Netherlands','Dutch','Belgium','Belgian','Switzerland','Swiss','Austria','Austrian',
  'Germany','German','Greece','Greek','Cyprus','Cypriot','Luxembourg','Luxembourgish','Liechtenstein','Liechtensteiner',
];

// Validar formato de email
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function getTagValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function getAllTagValues(xml: string, tag: string): string[] {
  const values: string[] = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let match;

  while ((match = regex.exec(xml)) !== null) {
    values.push(match[1].trim());
  }

  return values;
}

export async function procurarPubmed(keyword: string, maxResultados = 100, userEmail = 'noemail@example.com'): Promise<string[]> {
  try {
    // Adicionar filtros: artigos dos últimos 5 anos, Research articles
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 5;
    const searchTerm = `${keyword} AND ("Journal Article"[Publication Type] OR "Research Support, U.S. Gov't, Non-P.H.S."[Publication Type]) AND ${minYear}:${currentYear}[Publication Date]`;
    
    const url = `${API_URL}/pubmed/search?keyword=${encodeURIComponent(searchTerm)}&maxResults=${maxResultados}&email=${encodeURIComponent(userEmail)}`;
    console.log('Requisitando (com filtros):', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    const idList = data?.esearchresult?.idlist || [];
    console.log(`procurarPubmed('${keyword}'): ${idList.length} IDs encontrados`);
    
    return idList;
  } catch (error) {
    console.error('Erro em procurarPubmed:', error);
    throw error;
  }
}

export async function extrairCorrespondingAuthors(idList: string[], lote = 50, userEmail = 'noemail@example.com') {
  const resultados: Array<{
    id: string;
    Nome: string;
    Email: string;
    Título: string;
    Afiliação: string;
    DOI?: string;
    PMID?: string;
  }> = [];
  const seenEmails = new Set<string>();

  if (!idList || idList.length === 0) {
    console.log('extrairCorrespondingAuthors: Lista de IDs vazia');
    return resultados;
  }

  try {
    for (let i = 0; i < idList.length; i += lote) {
      const subset = idList.slice(i, i + lote).join(',');
      const url = `${API_URL}/pubmed/fetch?ids=${encodeURIComponent(subset)}&email=${encodeURIComponent(userEmail)}`;
      
      console.log(`Buscando lote ${Math.floor(i / lote) + 1}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();

      const articleBlocks = xml.match(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/gi) || [];
      console.log(`Lote ${Math.floor(i / lote) + 1}: ${articleBlocks.length} artigos encontrados`);

      for (const articleBlock of articleBlocks) {
        const title = getTagValue(articleBlock, 'ArticleTitle');
        // Extrair DOI
        const doi = getTagValue(articleBlock, 'ELocationID') || 
                   getTagValue(articleBlock, 'ArticleId');
        // Extrair PMID
        const pmidMatch = articleBlock.match(/<PMID[^>]*>(\d+)<\/PMID>/i);
        const pmid = pmidMatch ? pmidMatch[1] : undefined;
        
        const authorBlocks = articleBlock.match(/<Author[\s\S]*?<\/Author>/gi) || [];

        for (const authorBlock of authorBlocks) {
          const firstName = getTagValue(authorBlock, 'ForeName');
          const lastName = getTagValue(authorBlock, 'LastName');
          const authorName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Autor Desconhecido';
          const affiliations = getAllTagValues(authorBlock, 'Affiliation');

          for (const affiliation of affiliations) {
            // Validar que tem país alvo
            const hasCountry = LOCAIS_ALVO.some((pais) =>
              affiliation.toLowerCase().includes(pais.toLowerCase())
            );

            if (!hasCountry) continue;

            // Extrair email com regex mais rigoroso
            const emailMatches = affiliation.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g) || [];
            
            if (emailMatches.length === 0) continue;

            // Validar email contra regex RFC
            const validEmails = emailMatches.filter(email => emailRegex.test(email));
            if (validEmails.length === 0) continue;

            const email = validEmails[0];
            
            // Evitar duplicatas
            if (seenEmails.has(email)) continue;
            seenEmails.add(email);

            // Validar que nome não é vazio
            if (!authorName || authorName === 'Autor Desconhecido') continue;

            resultados.push({
              id: email,
              Nome: authorName,
              Email: email,
              Título: title || 'Título Desconhecido',
              Afiliação: affiliation,
              DOI: doi,
              PMID: pmid,
            });
          }
        }
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    }
    
    console.log(`extrairCorrespondingAuthors: ${resultados.length} autores únicos encontrados`);
  } catch (error) {
    console.error('Erro em extrairCorrespondingAuthors:', error);
    throw error;
  }

  return resultados;
}