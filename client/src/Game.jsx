import { ChatBox } from "./ui/ChatBox"

export function Game({ client }) {
  return (
    <div>
      <ChatBox client={client} />
    </div>
  )
}