import { useState } from "react";
import './npcChatBox.scss';
import networkConstants from '../../../networkConstants.json';

export function NpcChatBox({ client }) {
  const [hidden, setHidden] = useState(true)
  const [chat, setChat] = useState({});
  const [npcId, setNpcId] = useState(null);

  function chooseOption(choice) {
    client.send({
      id: networkConstants.npcChat,
      npcId,
      choice
    });
  }

  client.handleNpcChatMessages = ({ chat, npcId }) => {
    setHidden(!chat)
    setChat(chat)
    setNpcId(npcId)
  }

  function options() {
    if (chat?.options) {
      return (
      <>
        {
            chat.options.map((option, i) => <button key={i} onClick={()=>chooseOption(i)} disabled={!option.isAvailable}>{option.text}</button>)
        }
      </>
      )
    }
    if (chat)
      return <button onClick={()=>chooseOption()}>Next</button>
  }
  return (
    <>
      {!hidden && <div className="npc-chat-box">
        <div>{chat?.text}</div>
        {options()}
      </div>}
    </>
  )
}