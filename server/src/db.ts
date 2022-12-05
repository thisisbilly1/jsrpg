import Realm from "realm";
const TaskSchema = {
  name: "User",
  properties: {
    username: "string",
    password: "string",
  },
  primaryKey: "username",
};

export function connect() {
  return Realm.open({
    path: "myrealm",
    schema: [TaskSchema],
  });
}