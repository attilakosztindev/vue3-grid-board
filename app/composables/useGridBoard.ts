import type { GridBoardResponse, GridConfig, GridLayoutItem } from '#shared/types/grid'

const DEFAULT_CONFIG: GridConfig = {
  colNum: 12,
  rowHeight: 40,
  margin: [10, 10],
  interactive: false
}

export interface UseGridBoardOptions {
  endpoint?: string
  layout?: GridLayoutItem[]
  config?: Partial<GridConfig>
}

export async function useGridBoard({
  endpoint = '',
  layout: fallbackLayout = [],
  config: fallbackConfig = {}
}: UseGridBoardOptions = {}) {
  const fetched = endpoint ? await useFetch<GridBoardResponse>(endpoint) : null
  const response = computed<GridBoardResponse | null>(() => fetched?.data.value ?? null)

  const layout = ref<GridLayoutItem[]>(
    (response.value?.layout ?? fallbackLayout ?? []).map((i) => ({ ...i }))
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
    const { rowHeight: rh, margin } = config.value
    const my = margin[1]
    const bottom = layout.value.reduce((max, i) => Math.max(max, i.y + i.h), 0)
    return `${bottom * (rh + my) + my}px`
  })

  watch(response, (v) => {
    if (v?.layout && layout.value.length === 0) {
      layout.value = v.layout.map((i) => ({ ...i }))
      isDynamic.value = v.config?.interactive ?? isDynamic.value
    }
  })

  function skeletonStyle(item: GridLayoutItem) {
    const { colNum: cols, rowHeight: rh, margin } = config.value
    const [mx, my] = margin
    const colExpr = `((100% - ${(cols + 1) * mx}px) / ${cols})`
    return {
      position: 'absolute',
      top: `${rh * item.y + (item.y + 1) * my}px`,
      left: `calc(${colExpr} * ${item.x} + ${(item.x + 1) * mx}px)`,
      width: `calc(${colExpr} * ${item.w} + ${Math.max(0, item.w - 1) * mx}px)`,
      height: `${rh * item.h + Math.max(0, item.h - 1) * my}px`
    }
  }

  return { layout, config, isDynamic, clientFallback, skeletonStyle, skeletonHeight }
}
