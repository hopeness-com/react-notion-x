import got from 'got'
import lqip from 'lqip-modern'
import { ExtendedRecordMap, PreviewImage, PreviewImageMap } from 'notion-types'
import { Block } from 'notion-types'
import { getPageImageUrls } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'
// import { defaultMapImageUrl } from 'react-notion-x'

// NOTE: this is just an example of how to pre-compute preview images.
// Depending on how many images you're working with, this can potentially be
// very expensive to recompute, so in production we recommend that you cache
// the preview image results in a key-value database of your choosing.
// If you're not sure where to start, check out https://github.com/jaredwray/keyv

export async function getPreviewImageMap(
  recordMap: ExtendedRecordMap
): Promise<PreviewImageMap> {
  const urls: string[] = getPageImageUrls(recordMap, {
    mapImageUrl: defaultMapImageUrl
  })

  const previewImagesMap = Object.fromEntries(
    await pMap(urls, async (url) => [url, await getPreviewImage(url)], {
      concurrency: 8
    })
  )

  return previewImagesMap
}

async function createPreviewImage(url: string): Promise<PreviewImage | null> {
  try {
    const { body } = await got(url, { responseType: 'buffer' })
    const result = await lqip(body)
    console.log('lqip', { originalUrl: url, ...result.metadata })

    return {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64
    }
  } catch (err) {
    if (
      (err as Error).message ===
      'Input buffer contains unsupported image format'
    ) {
      return null
    }

    console.warn('failed to create preview image', url, (err as Error).message)
    return null
  }
}

// Due to the react 18, server component can not use a client function, so temporarily
// hart copy the defaultMapImageUrl
const defaultMapImageUrl = (url: string, block: Block): string | null => {
  if (!url) {
    return null
  }

  if (url.startsWith('data:')) {
    return url
  }

  // more recent versions of notion don't proxy unsplash images
  if (url.startsWith('https://images.unsplash.com')) {
    return url
  }

  try {
    const u = new URL(url)

    if (
      u.pathname.startsWith('/secure.notion-static.com') &&
      u.hostname.endsWith('.amazonaws.com')
    ) {
      if (
        u.searchParams.has('X-Amz-Credential') &&
        u.searchParams.has('X-Amz-Signature') &&
        u.searchParams.has('X-Amz-Algorithm')
      ) {
        // if the URL is already signed, then use it as-is
        return url
      }
    }
  } catch {
    // ignore invalid urls
  }

  if (url.startsWith('/images')) {
    url = `https://www.notion.so${url}`
  }

  url = `https://www.notion.so${
    url.startsWith('/image') ? url : `/image/${encodeURIComponent(url)}`
  }`

  const notionImageUrlV2 = new URL(url)
  let table = block.parent_table === 'space' ? 'block' : block.parent_table
  if (table === 'collection' || table === 'team') {
    table = 'block'
  }
  notionImageUrlV2.searchParams.set('table', table)
  notionImageUrlV2.searchParams.set('id', block.id)
  notionImageUrlV2.searchParams.set('cache', 'v2')

  url = notionImageUrlV2.toString()

  return url
}

export const getPreviewImage = pMemoize(createPreviewImage)
