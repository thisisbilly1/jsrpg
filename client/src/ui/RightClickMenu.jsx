import './rightClickMenu.scss'

export function RightClickMenu({ options, clickOption, closeMenu }) {
  return (
    <div className="right-click">
      {options.map(option =>
        <div
          className='option'
          key={option}
          onClick={() => clickOption(option)}
        >
          {option}
        </div>
      )}
      <div className='option' onClick={closeMenu}>cancel</div>
    </div>
  )
}