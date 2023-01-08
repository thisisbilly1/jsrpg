import Realm from "realm";
const TaskSchema: Realm.ObjectSchema = {
  name: "User",
  primaryKey: "username",
  properties: {
    username: "string",
    password: "string",
    npcChats: "{}",
  },
};

export function connect() {
  return Realm.open({
    path: "myrealm",
    schema: [TaskSchema],
  });
}