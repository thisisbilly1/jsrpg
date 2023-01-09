import Realm from "realm";
import { Item } from "./inventory/items/item";

export class User {
  public static schema: Realm.ObjectSchema = {
    name: "User",
    primaryKey: "username",
    properties: {
      username: "string",
      password: "string",
      npcChats: "{}",
      inventory: {type: 'list', objectType: 'item'},
    }
  }
  public username!: string
  public password!: string
  public npcChats!: { [x: number]: string }
  public inventory!: Array<Item>
}

export function connect() {
  return Realm.open({
    path: "myrealm",
    schema: [User.schema, Item.schema],
  });
}