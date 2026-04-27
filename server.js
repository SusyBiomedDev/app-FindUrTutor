const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Proxy para PubMed Search
app.get('/api/pubmed/search', async (req, res) => {
  try {
    const { keyword, maxResults = 100, email } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const params = new URLSearchParams({
      db: 'pubmed',
      term: keyword,
      retmax: maxResults,
      retmode: 'json',
    });

    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': `FindUrTutor-App/1.0 (${email || 'noemail@example.com'})`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in /api/pubmed/search:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy para PubMed Fetch
app.get('/api/pubmed/fetch', async (req, res) => {
  try {
    const { ids, email } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'IDs are required' });
    }

    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${encodeURIComponent(ids)}&rettype=xml`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': `FindUrTutor-App/1.0 (${email || 'noemail@example.com'})`,
      },
    });

    const xml = await response.text();
    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Error in /api/pubmed/fetch:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`FindUrTutor Backend running on http://localhost:${PORT}`);
});
