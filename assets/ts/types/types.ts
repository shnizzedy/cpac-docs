"use strict"

// Edit the TypeScript file, not the compiled JavaScript file.

type _MetaData = {
  title?: string | null;
};

type _ParagraphsData = {
  details?: _DetailsData;
  paragraph?: _ParagraphData;
  paragraphs?: _ParagraphsData;
  subparagraphs?: _ParagraphsData;
};

type _ParagraphData = string;

type _DetailsData = string[];

export type ParagraphsList = (_ParagraphData | _ParagraphsData | _DetailsData)[];

export type YamlData = {
  meta?: _MetaData;
  paragraphs?: ParagraphsList;
};
