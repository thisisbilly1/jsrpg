import { RightClickMenu } from './RightClickMenu';
import './inventory.scss';
import { useEffect, useRef, useState } from 'react';
import networkConstants from '../../../networkConstants.json';

// item = { name, options[] }
function Slot({ item, sendRightClickOption }) {
  const [showMenu, setShowMenu] = useState(false)

  function openRightClick(event) {
    event.preventDefault();
    if (item) setShowMenu(true)
  }

  function clickOption(option) {
    sendRightClickOption(option)
    closeMenu()
  }

  function closeMenu() {
    setShowMenu(false)
  }

  return (
    <div className='slot'
      onContextMenu={openRightClick}
    >
      {item &&
        <div>
          {item.name}
        </div>
      }
      {
        showMenu && item &&
        <RightClickMenu
          options={item.options}
          clickOption={clickOption}
          closeMenu={closeMenu}
        />
      }
    </div>
  )
}

export function Inventory({ client }) {
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [items, setItems] = useState([])
  const [a, seta] = useState(0)

  // set the client handleInventory network function
  client.handleInventory = ({ items }) => {
    seta(a + 1)
    setItems(items)
  }

  function sendRightClickOption(action, index) {
    client.send({
      id: networkConstants.inventory,
      type: 'clickOption',
      itemIndex: index,
      action,
    })
  }

  useEffect(() => {
    // request the inventory on comp mount
    client.send({
      id: networkConstants.inventory,
      type: 'requestInventory'
    })
  }, [])


  // handle dragging
  function dragStart(position) {
    dragItem.current = position
  }

  function dragEnter(position) {
    dragOverItem.current = position
  }

  function drop() {
    // request the inventory swap
    if (dragItem.current === dragOverItem.current) return;
    client.send({
      id: networkConstants.inventory,
      type: 'swap',
      itemIndex1: dragItem.current,
      itemIndex2: dragOverItem.current,
    })
    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div className="inventory">
      {
        items.map((item, index) =>
          <div
            className='slot-wrapper'
            draggable={!!item}
            onDragStart={() => dragStart(index)}
            onDragEnter={() => dragEnter(index)}
            onDragEnd={drop}
            key={index}
          >
            <Slot
              item={item}
              sendRightClickOption={option => sendRightClickOption(option, index)}
            />
          </div>
        )
      }
    </div>
  )
}