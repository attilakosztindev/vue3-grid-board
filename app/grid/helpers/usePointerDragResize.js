const DRAG_THRESHOLD = 3
const EDGE = 60
const MAX_SPEED = 18

export function usePointerDragResize(root, options) {
  const {
    handleSelector = '.grid-handle',
    draggable = () => false,
    resizable = () => false,
    dragIgnore = () => null,
    dragHandle = () => null,
    resizeIgnore = () => null,
    autoScroll = () => true,
    onDrag = () => {},
    onResize = () => {}
  } = options

  let pointerId = null
  let mode = null
  let started = false
  let originX = 0
  let originY = 0
  let clientX = 0
  let clientY = 0
  let scrollRaf = 0
  let frameToken = 0
  let pendingMove = false
  let viewportW = 0
  let viewportH = 0

  function tryCall(fn) {
    try {
      fn()
      return true
    } catch {
      return false
    }
  }

  function matches(node, selector) {
    if (!selector) return false
    const found = node.closest?.(selector)
    return !!found && root.contains(found)
  }

  function emit(kind, x = clientX, y = clientY) {
    const evt = { type: kind, target: root, clientX: x, clientY: y }
    if (mode === 'resize') onResize(evt)
    else onDrag(evt)
  }

  function openFrameWindow() {
    frameToken = requestAnimationFrame(() => {
      frameToken = 0
      if (pointerId === null || !started || !pendingMove) return
      pendingMove = false
      emit(`${mode}move`)
      openFrameWindow()
    })
  }

  function scheduleMove() {
    if (frameToken) {
      pendingMove = true
      return
    }
    emit(`${mode}move`)
    openFrameWindow()
  }

  function cancelScheduledMove() {
    if (frameToken) cancelAnimationFrame(frameToken)
    frameToken = 0
    pendingMove = false
  }

  function emitMoveNow() {
    cancelScheduledMove()
    emit(`${mode}move`)
  }

  function onPointerDown(e) {
    if (pointerId !== null) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const onHandle = matches(e.target, handleSelector)

    if (onHandle && resizable()) {
      if (matches(e.target, resizeIgnore())) return
      mode = 'resize'
    } else if (!onHandle && draggable()) {
      const ignore = dragIgnore()
      const handle = dragHandle()
      if (ignore && matches(e.target, ignore)) return
      if (handle && !matches(e.target, handle)) return
      mode = 'drag'
    } else {
      return
    }

    pointerId = e.pointerId
    started = false
    originX = clientX = e.clientX
    originY = clientY = e.clientY
    measureViewport()

    tryCall(() => root.setPointerCapture(e.pointerId))

    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerup', onPointerUp)
    root.addEventListener('pointercancel', onPointerUp)
    root.addEventListener('lostpointercapture', onPointerUp)
    window.addEventListener('resize', measureViewport, { passive: true })
  }

  function onPointerMove(e) {
    if (e.pointerId !== pointerId) return
    clientX = e.clientX
    clientY = e.clientY

    if (!started) {
      if (Math.hypot(clientX - originX, clientY - originY) < DRAG_THRESHOLD) return
      started = true
      emit(`${mode}start`, originX, originY)
    }

    e.preventDefault()
    scheduleMove()

    if (mode === 'drag' && !scrollRaf && nearEdge() && autoScroll()) runAutoScroll()
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return
    if (started) {
      if (pendingMove) emitMoveNow()
      emit(`${mode}end`)
    }
    teardown()
  }

  function teardown() {
    cancelScheduledMove()
    stopAutoScroll()
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerup', onPointerUp)
    root.removeEventListener('pointercancel', onPointerUp)
    root.removeEventListener('lostpointercapture', onPointerUp)
    window.removeEventListener('resize', measureViewport)
    tryCall(() => {
      if (pointerId !== null && root.hasPointerCapture?.(pointerId)) {
        root.releasePointerCapture(pointerId)
      }
    })
    pointerId = null
    mode = null
    started = false
  }

  function speed(distance) {
    return Math.min(MAX_SPEED, (distance / EDGE) * MAX_SPEED)
  }

  function measureViewport() {
    viewportW = window.innerWidth
    viewportH = window.innerHeight
  }

  function nearEdge() {
    return (
      clientX < EDGE || clientY < EDGE || clientX > viewportW - EDGE || clientY > viewportH - EDGE
    )
  }

  function runAutoScroll() {
    if (scrollRaf) return
    const step = () => {
      scrollRaf = 0
      if (pointerId === null || !started) return
      const vw = viewportW
      const vh = viewportH
      let dx = 0
      let dy = 0
      if (clientY < EDGE) dy = -speed(EDGE - clientY)
      else if (clientY > vh - EDGE) dy = speed(clientY - (vh - EDGE))
      if (clientX < EDGE) dx = -speed(EDGE - clientX)
      else if (clientX > vw - EDGE) dx = speed(clientX - (vw - EDGE))

      if (dx || dy) {
        window.scrollBy({ left: dx, top: dy, behavior: 'instant' })
        emitMoveNow()
        scrollRaf = requestAnimationFrame(step)
      }
    }
    scrollRaf = requestAnimationFrame(step)
  }

  function stopAutoScroll() {
    if (scrollRaf) cancelAnimationFrame(scrollRaf)
    scrollRaf = 0
  }

  root.addEventListener('pointerdown', onPointerDown)

  function destroy() {
    root.removeEventListener('pointerdown', onPointerDown)
    if (pointerId === null) {
      stopAutoScroll()
      return
    }
    if (started) {
      if (pendingMove) emitMoveNow()
      emit(`${mode}end`)
    }
    teardown()
  }

  return { destroy }
}
