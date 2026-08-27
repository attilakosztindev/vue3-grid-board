import type { GridBoardResponse, GridConfig, GridTileData } from '#shared/types/grid'

const DEFAULT_CONFIG: GridConfig = {
  columns: 12,
  rowHeight: 40,
  gap: 10,
  interactive: false
}

export interface UseDemoBoardOptions {
  endpoint?: string
  tiles?: GridTileData[]
  config?: Partial<GridConfig>
}

export async function useDemoBoard({
  endpoint = '',
  tiles: fallbackTiles = [],
  config: fallbackConfig = {}
}: UseDemoBoardOptions = {}) {
  const fetched = endpoint ? await useFetch<GridBoardResponse>(endpoint) : null
  const response = computed<GridBoardResponse | null>(() => fetched?.data.value ?? null)

  const tiles = ref<GridTileData[]>(
    (response.value?.tiles ?? fallbackTiles ?? []).map((t) => ({ ...t }))
  )

  const isDynamic = ref(
    { ...DEFAULT_CONFIG, ...fallbackConfig, ...(response.value?.config ?? {}) }.interactive
  )

  const clientFallback = computed(() => !endpoint || !!fetched?.error.value)

  const config = computed<GridConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...fallbackConfig,
    ...(response.value?.config ?? {})
  }))

  const skeletonHeight = computed(() => {
    const { rowHeight, gap } = config.value
    const bottom = tiles.value.reduce((max, t) => Math.max(max, t.y + t.h), 0)
    return `${bottom * (rowHeight + gap) + gap}px`
  })

  watch(response, (v) => {
    if (v?.tiles && tiles.value.length === 0) {
      tiles.value = v.tiles.map((t) => ({ ...t }))
      isDynamic.value = v.config?.interactive ?? isDynamic.value
    }
  })

  function skeletonStyle(tile: GridTileData) {
    const { columns, rowHeight, gap } = config.value
    const colExpr = `((100% - ${(columns + 1) * gap}px) / ${columns})`
    return {
      position: 'absolute',
      top: `${rowHeight * tile.y + (tile.y + 1) * gap}px`,
      left: `calc(${colExpr} * ${tile.x} + ${(tile.x + 1) * gap}px)`,
      width: `calc(${colExpr} * ${tile.w} + ${Math.max(0, tile.w - 1) * gap}px)`,
      height: `${rowHeight * tile.h + Math.max(0, tile.h - 1) * gap}px`
    }
  }

  return { tiles, config, isDynamic, clientFallback, skeletonStyle, skeletonHeight }
}
