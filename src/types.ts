export interface InsiderTrade {
  publicationDate: string;
  issuer: string;
  person: string;
  role: string;
  isCloseAssociate: boolean;
  transactionType: "Förvärv" | "Avyttring" | string;
  instrument: string;
  instrumentType: string;
  isin: string;
  transactionDate: string;
  volume: number;
  unit: string;
  price: number;
  currency: string;
  detailsUrl?: string;
}

export interface TradeScore {
  trade: InsiderTrade;
  totalScore: number;
  breakdown: {
    roleWeight: number;
    sizeSignal: number;
    clusterSignal: number;
    contraTrend: number;
    companySizeBonus: number;
  };
  reasoning: string;
}

export interface WatchlistEntry {
  name: string;
  isin?: string;
  addedAt: string;
  reason?: string;
}

export interface Watchlist {
  companies: WatchlistEntry[];
}
