import mongoose from "mongoose";
import { Events } from "../../index";
import DartCommands from "../index";

const Name = "dartcommands-prefixes";

const schema = new mongoose.Schema({
  GuildID: {
    type: String,
    required: true,
  },
  Prefix: {
    type: String,
    required: true,
  },
});

schema.post("save", (guildid, prefix) => {
  DartCommands.prototype.client.emit<Events>(
    "Dart.UpdatePrefix",
    guildid,
    prefix
  );
});

export default mongoose.models[Name] || mongoose.model(Name, schema);
