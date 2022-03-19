import mongoose from "mongoose";

const Name = "dartcommands-prefixes";

export default mongoose.models[Name] ||
  mongoose.model(
    Name,
    new mongoose.Schema({
      GuildID: {
        type: String,
        required: true,
      },
      Prefix: {
        type: String,
        required: true,
      },
    })
  );
