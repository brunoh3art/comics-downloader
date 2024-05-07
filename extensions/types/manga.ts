export interface MangaResponseRoot {
  result: string;
  response: string;
  data: Data;
}

export interface Data {
  id: string;
  type: string;
  attributes: Attributes;
  relationships: Relationship[];
}

export interface Attributes {
  title: Title;
  altTitles: AltTitle[];
  description: Description;
  isLocked: boolean;
  links: Links;
  originalLanguage: string;
  lastVolume: string;
  lastChapter: string;
  publicationDemographic: string;
  status: string;
  year: number;
  contentRating: string;
  tags: Tag[];
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string;
}

export interface Title {
  en: string;
}

export interface AltTitle {
  ja?: string;
  "ja-ro"?: string;
  ru?: string;
  cs?: string;
}

export interface Description {
  cs: string;
  en: string;
  ru: string;
  tr: string;
}

export interface Links {
  al: string;
  ap: string;
  bw: string;
  kt: string;
  mu: string;
  amz: string;
  cdj: string;
  ebj: string;
  mal: string;
  raw: string;
  engtl: string;
}

export interface Tag {
  id: string;
  type: string;
  attributes: Attributes2;
  relationships: any[];
}

export interface Attributes2 {
  name: Name;
  description: Description2;
  group: string;
  version: number;
}

export interface Name {
  en: string;
}

export interface Description2 {}

export interface Relationship {
  id: string;
  type: string;
  related?: string;
}
