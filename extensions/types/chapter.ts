export interface Chapter {
  id: string;
  host: string;
  chapterHash: string;
  data: string[];
  dataSaver: string;
}

export interface ChaptersResponseRoot {
  result: string;
  response: string;
  data: Daum[];
  limit: number;
  offset: number;
  total: number;
}

export interface Daum {
  id: string;
  type: string;
  attributes: Attributes;
  relationships: Relationship[];
}

export interface Attributes {
  volume?: string;
  chapter: string;
  title?: string;
  translatedLanguage: string;
  externalUrl?: string;
  publishAt: string;
  readableAt: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  version: number;
}

export interface Relationship {
  id: string;
  type: string;
}
