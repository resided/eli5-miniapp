export interface CastAuthor {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface Cast {
  author: CastAuthor;
  text: string;
  hash: string;
  images?: string[];
}

export type AppState = "loading" | "no-cast" | "explaining" | "result";

