export function Resizer({ setHeight, height, children, minHeight = 100 }) {

  const startResizing = () => {
    window.addEventListener('mousemove', Resize, false);
    window.addEventListener('mouseup', stopResize, false);
  }

  const stopResize = () => {
    window.removeEventListener('mousemove', Resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }

  const Resize = e => {
    if (height - e.movementY > minHeight)
      setHeight(prev => prev - e.movementY)
  }

  return (
    <div onMouseDown={startResizing}>{children}</div>
  )
}