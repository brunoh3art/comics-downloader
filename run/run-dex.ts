import { $ } from "bun";

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  fetchChapters,
  findChaptersManga,
  findImage,
  findMangaById,
  mangadexUploadHost,
} from "../extensions/mangadex";

import type { Chapter } from "../extensions/types/chapter";

export async function comicsDownloader({ mangaId }: { mangaId: string }) {
  try {
    const { data } = await findMangaById(mangaId);

    if (!data) {
      console.log`"Comics/Manga not found"`;
    }

    const { chapters } = await fetchChapters(mangaId);

    const chaptersImagesPath: string[] = [];

    for (const [index, chapter] of chapters.entries()) {
      const chapterTitle = chapter.title
        ? `Capítulo ${chapter.number} - ${chapter.title.replace(".", "")}`
        : `Capítulo ${chapter.number}`;
      console.log`"'Downloading ${chapterTitle}"`;

      const chapterData = await findChaptersManga(chapter.id);
      const folderName = `manga/${data.attributes.title.en}/chapters/${chapterTitle}`;

      createFolder(folderName);

      chaptersImagesPath.push(
        ...(await downloadChapter(chapterData, index, folderName))
      );
    }

    await verifyIfAllChapterWereDownloaded(chaptersImagesPath);

    console.log`"All chapters downloaded successfully"`;
  } catch (err) {
    console.log`"Error: Failed to download chapters"`;
  }
}

async function verifyIfAllChapterWereDownloaded(
  chaptersImagesPath: string[]
): Promise<void> {
  console.log`"Verifying if all chapters were downloaded: ${chaptersImagesPath.length}"`;
  const notDownloaded = chaptersImagesPath.filter((path) => !existsSync(path));
  console.log`"Chapters not downloaded: ${notDownloaded.length}"`;
}

async function downloadChapter(
  chapterData: Chapter,
  chapter: number,
  comicPath: string
): Promise<string[]> {
  const { data, chapterHash } = chapterData;
  const chapterImagesPath: string[] = [];

  let count = 1;

  const responses = await Promise.all(
    data.map(async (page, pageIndex: number) => {
      const pageUrl = `${mangadexUploadHost}/data/${chapterHash}/${page}`;
      const folderName = join(comicPath);

      const pagePath = join(
        folderName,
        `${count.toString().padStart(4, "0")}.jpg`
      );

      chapterImagesPath.push(pageUrl);
      count++;

      return {
        path: pagePath,
        page,
        response: await findImage(pageUrl),
      };
    })
  );

  for (const image of responses) {
    // await $` "Path downloading: ${image.path}"`;

    writeFileSync(image.path, image.response.data);
  }

  return chapterImagesPath;
}

async function createFolder(path: string) {
  const { stdout } = await $`mkdir -p ${path}`.quiet();

  return path;
}
