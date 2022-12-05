import { useRef, useState } from "react";
import { Resizable } from "./Resizable/Resizable";
import './chatbox.scss';
import networkConstants from '../../../networkConstants.json';

export function ChatBox({ client }) {
  const message = useRef();
  const [messages, setMessages] = useState([]);

  const submit = e => {
    e.preventDefault();
    client.send({
      id: networkConstants.message,
      message: message.current.value
    });
    message.current.value = '';
  }

  client.handleChatMessages = ({ message }) => {
    setMessages(p => [...p, message]);
  }

  const messageDivs =
    messages.map((message, i) =>
      <div key={i} className="text">{message}</div>
    );

  return (
    <div className="chat-box">
      <Resizable>
        <div className="text-container">
          {messageDivs}
        </div>
      </Resizable>
      <form onSubmit={submit} className="text-box">
        <input type="text" ref={message} maxLength={92}></input>
        <button type="submit">Send</button>
      </form>

    </div>
  )
}