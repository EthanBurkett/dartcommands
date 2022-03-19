import { MessageEmbed } from "discord.js";
import { LANG_ENGLISH } from "../../index.d";

export let Messages = {
  minArgs: `You need to supply at least {MIN} arguments.\nCorrect syntax: {EXPECTED}`,
  maxArgs: `You can only supply up to {MAX} arguments.\nCorrect syntax: {EXPECTED}`,
  noPermisssion: `You do not have permission to run this command, you need to have the {PERMISSION} permission.`,
  ownerOnly: `Only the bot owners can run this command`,
  testOnly: `This command can not be run in this server`,
  prefixUpdated: `Updated this guild's prefix to **{PREFIX}**`,
} as LANG_ENGLISH;
