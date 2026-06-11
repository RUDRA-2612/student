import algoliasearch from 'algoliasearch'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || '';

const mockMode = !appId || !adminKey || appId === 'ALGOLIA_APP_ID' || adminKey === 'ALGOLIA_ADMIN_KEY';

const createMockIndex = (name: string) => ({
  setSettings: async (settings: any) => {
    console.log(`[MOCK ALGOLIA] Index ${name} configured settings:`, settings)
    return {}
  },
  saveObject: async (obj: any) => {
    console.log(`[MOCK ALGOLIA] Saved object to index ${name}:`, obj)
    return {}
  },
  deleteObject: async (id: string) => {
    console.log(`[MOCK ALGOLIA] Deleted object ${id} from index ${name}`)
    return {}
  },
  search: async (query: string, options?: any) => {
    console.log(`[MOCK ALGOLIA] Search in index ${name} for "${query}" with:`, options)
    return { hits: [], nbHits: 0, nbPages: 0 }
  }
})

let client: any = null
export let algolia: {
  papers: any
  questions: any
  faqs: any
}

if (mockMode) {
  algolia = {
    papers: createMockIndex('examedge_papers'),
    questions: createMockIndex('examedge_questions'),
    faqs: createMockIndex('examedge_faqs'),
  }
} else {
  client = algoliasearch(appId, adminKey)
  algolia = {
    papers: client.initIndex('examedge_papers'),
    questions: client.initIndex('examedge_questions'),
    faqs: client.initIndex('examedge_faqs'),
  }
}

export async function configureIndices() {
  await algolia.papers.setSettings({
    searchableAttributes: ['title', 'university', 'subject.name', 'tags'],
    attributesForFaceting: ['subject.name', 'examType', 'year', 'difficulty', 'university'],
    customRanking: ['desc(downloadCount)', 'desc(viewCount)'],
  })

  await algolia.questions.setSettings({
    searchableAttributes: ['text', 'topic', 'chapter', 'subject.name'],
    attributesForFaceting: ['subject.name', 'importance', 'type'],
    customRanking: ['desc(predictedScore)'],
  })
}

export async function indexPaper(paper: any) {
  await algolia.papers.saveObject({
    objectID:      paper.id,
    title:         paper.title,
    university:    paper.university,
    year:          paper.year,
    examType:      paper.examType,
    difficulty:    paper.difficulty,
    subject:       { name: paper.subject.name, code: paper.subject.code },
    tags:          paper.tags.map((t: any) => t.name),
    downloadCount: paper.downloadCount,
    viewCount:     paper.viewCount,
  })
}
