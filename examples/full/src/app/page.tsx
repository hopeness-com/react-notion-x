import React from 'react'

import { ExtendedRecordMap } from 'notion-types'
import * as notion from '../lib/notion'
import { NotionPage } from '../components/notion/NotionPage'
import {
  previewImagesEnabled,
  rootDomain,
  rootNotionPageId
} from '../lib/config'

async function getData() {
  const recordMap = await notion.getPage(rootNotionPageId)
  return recordMap
}

export default async function Page() {
  const recordMap: ExtendedRecordMap = await getData()
  return (
    <NotionPage
      recordMap={recordMap}
      rootDomain={rootDomain}
      rootPageId={rootNotionPageId}
      previewImagesEnabled={previewImagesEnabled}
    />
  )
}
