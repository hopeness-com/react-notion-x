import React from 'react'

import { ExtendedRecordMap } from 'notion-types'
import * as notion from '../../lib/notion'
import { NotionPage } from '../../components/notion/NotionPage'
import {
  previewImagesEnabled,
  rootDomain,
  rootNotionPageId
} from '../../lib/config'

async function getData(params: { slug: string }) {
  const pageId = params.slug as string
  const recordMap = await notion.getPage(pageId)
  return recordMap
}

export default async function Page({ params }: { params: { slug: string } }) {
  const recordMap: ExtendedRecordMap = await getData(params)
  return (
    <NotionPage
      recordMap={recordMap}
      rootDomain={rootDomain}
      rootPageId={rootNotionPageId}
      previewImagesEnabled={previewImagesEnabled}
    />
  )
}
