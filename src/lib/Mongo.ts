import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { Utils } from "../index";
import { ICache } from "../../index.d";
import Prefixes from "../Models/Prefixes";

export async function Connect(uri: string, dbOptions = {}) {
  const options = {
    keepAlive: true,
    ...dbOptions,
  };
  try {
    await mongoose
      .connect(uri, options)
      .catch((e: any) => {
        Utils.CLIError("Mongo: " + e);
        process.exit(0);
      })
      .then(() => Utils.CLILog("Mongo connected"));
  } catch (e) {
    Utils.CLIError("Mongo: " + e);
    process.exit(0);
  }
}

export const Cache = {
  GuildPrefixes: new Collection<string, string>(),
  InitialCache: async () => {
    const res = await Prefixes.find();
    if (!res) return;

    res.map((Guild) => {
      Cache.GuildPrefixes.set(Guild.GuildID, Guild.Prefix);
    });

    return Cache;
  },
  async UpdatePrefix(GuildID: string, Prefix: string) {
    const res = await Prefixes.findOne({ GuildID });
    if (!res) {
      await Prefixes.create({
        GuildID,
        Prefix,
      });
    } else {
      await Prefixes.findOneAndUpdate(
        {
          GuildID,
        },
        {
          Prefix,
        }
      );
    }
    Cache.GuildPrefixes.set(GuildID, Prefix);
  },
};
