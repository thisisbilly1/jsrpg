import './inventory.scss';
import { useEffect, useState } from 'react';
import networkConstants from '../../../networkConstants.json';

function Slot({ item, onClick }) {
  return (
    <div className='slot' onClick={onClick}>
      {item &&
        <div>
          {item}
        </div>
      }
    </div>
  )
}

export function Equipment({ client }) {
  const [equipment, setEquipment] = useState({})

  // set the client handleInventory network function
  client.handlEquipment = ({
    head,
    body,
    legs,
    weapon,
    shield
  }) => {
    setEquipment(null)
    setEquipment({
      head,
      body,
      legs,
      weapon,
      shield
    })
  }

  useEffect(() => {
    // request the inventory on comp mount
    // client.send({
    //   id: networkConstants.inventory,
    //   type: 'requestInventory'
    // })
  }, [])

  function unequip(slot) {
    client.send({
      id: networkConstants.equipment,
      slot,
    })
  }

  return (
    <div className="inventory equipment">
      <Slot item={equipment.head} onClick={() => unequip('head')} />
      <Slot item={equipment.body} onClick={() => unequip('body')} />
      <Slot item={equipment.legs} onClick={() => unequip('legs')} />
      <Slot item={equipment.weapon} onClick={() => unequip('weapon')} />
      <Slot item={equipment.shield} onClick={() => unequip('shield')} />
    </div>
  )
}