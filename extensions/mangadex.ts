import axios, { type AxiosResponse } from "axios";
import * as http from "node:https";
import type { MangaResponseRoot } from "./types/manga";
import type { ChaptersResponseRoot } from "./types/chapter";
import { retry } from "@lifeomic/attempt";
import { $ } from "bun";

export const mangadexClient = axios.create({
  baseURL: "https://api.mangadex.org",
  httpAgent: new http.Agent({ keepAlive: true }),
});

export const mangadexUploadHost = "http://uploads.mangadex.org";

export const mangadexUploadClient = axios.create({
  baseURL: mangadexUploadHost,
  responseType: "arraybuffer",
  timeout: 30000,
  headers: {
    Connection: "Keep-Alive",
  },
});
// axios mangadex get image width & hight

export const findMangaById = async (id: string) => {
  const { data } = await mangadexClient.get<MangaResponseRoot>(`/manga/${id}`, {
    params: {
      "includes[]": "author",
    },
  });
  return data;
};

export const findMangaChapters = async (mangaId: string, offset = 0) => {
  const { data } = await mangadexClient.get<ChaptersResponseRoot>(
    `/manga/${mangaId}/feed`,
    {
      params: {
        "translatedLanguage[]": "pt-br",
        order: {
          volume: "asc",
          chapter: "asc",
        },
        limit: 100,
        offset,
      },
    }
  );

  return data;
};

export const findChaptersManga = async (chapterId: string) => {
  const { data } = await mangadexClient.get(`/at-home/server/${chapterId}`);

  return {
    id: chapterId,
    host: data.baseUrl,
    chapterHash: data.chapter.hash,
    data: data.chapter.data,
    dataSaver: data.chapter.dataSaver,
  };
};

export async function findImage(
  url: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<AxiosResponse<Buffer, any>> {
  return await retry(async () => await mangadexUploadClient(url), {
    delay: 200,
    factor: 2,
    maxAttempts: 30,

    handleError: async (_, ctx) => {
      await $`echo "im erroring bro :( (${String(
        ctx.attemptNum
      )} attempts, ${String(ctx.attemptsRemaining)} remaining)"`;

      /*showLogs &&
        console.log(
          `im erroring bro :( (${String(ctx.attemptNum)} attempts, ${String(
            ctx.attemptsRemaining
          )} remaining)`
        );*/
    },
  });
}

export async function fetchChapters(mangaId: string, language = "") {
  const BASE_OFFSET = 500;
  const chapters: {
    number: number;
    title: string | undefined;
    language: string;
    pageCount: number;
    id: string;
  }[] = [];

  const errors: unknown[] = [];

  async function fetchChaptersHelper(offset: number) {
    try {
      const data = await findMangaChapters(mangaId);

      for (const chapterData of data.data) {
        const chapterNumber = Number.parseFloat(chapterData.attributes.chapter);

        chapters.push({
          number: chapterNumber,
          title: chapterData.attributes.title,
          language: chapterData.attributes.translatedLanguage,
          pageCount: chapterData.attributes.pages,
          id: chapterData.id,
        });
      }

      if (data.data.length > 0) {
        //  await fetchChaptersHelper(offset + BASE_OFFSET);
      }
    } catch (error) {
      errors.push(error);
    }
  }

  await fetchChaptersHelper(0);

  return { chapters, errors };
}
