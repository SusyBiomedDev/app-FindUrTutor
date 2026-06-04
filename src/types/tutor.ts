// ─── Core result from PubMed extraction ──────────────────────────────────────

export type Tutor = {
  id:        string;
  nome:      string;
  area:      string;
  email:     string;
  afiliacao: string;
  doi?:      string;
  pmid?:     string;
};

// ─── Tutor with geocoded coordinates (used in MapScreen) ─────────────────────

export type TutorPin = Tutor & {
  latitude:  number;
  longitude: number;
};
