# Dart Commands

Dart Commands is a simple command handler to easily create discord bots meant to be lightweight.

## Getting started

To get started with DartCommands just install the package globally and run the CLI tool that automatically creates a boiler plate template

```
npm i -g dartcommands
```

And then run the CLI tool

```
dartcommands
```

### Without the CLI tool

First create your index file
`index.js`

```js
const DartCommands = require("dartcommands");
const { Client, Intents } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Settings with question marks mean they are optional
client.on('ready', () => {
  new DartCommands(client, {
    commandsDir: 'Commands',
    eventsDir?: 'Events',
    botOwners?: ['user id'],
    ignoreBots?: true | false,
    testServers?: ['server id'],
    typescript?: true | false,
    mongo?: {
      uri: 'mongo connection',
      options?: {
        keepAlive?: true | false
      }
    }
  })
})
```

### And that's it! You can now start creating commands for your bot

We're going to create a command that sends "Pong!" as a message

`Commands/ping.js`

```js
module.exports = {
  name?: 'ping',
  description: 'Returns pong!',
  ownerOnly?: true | false,
  testOnly?: true | false,
  minArgs?: 1,
  maxArgs?: 2,
  expectedArgs?: '<arg1> [arg2]',
  aliases?: ['p'],
  permission?: 'ADMINISTRATOR',
  async run({
    args,
    channel,
    guild,
    instance,
    member,
    message,
    text,
    user,
    client,
  }) {
    return "Pong!"
    or
    return channel.send({ content: "pong!" })
    or
    return {
      custom: true,
      content: "Pong!"
    }
    or
    return new MessageEmbed({
      description: "Pong!"
    })
  }
}
```

#### With TypeScript

```ts
import { ICommand } from "dartcommands";
export default {
  description: "Returns pong!",
  async run() {
    return "Pong!";
  },
} as ICommand;
```

# Making Events

You can implement your own events through custom files, keeping your events organized.
Simply create a folder named 'Events' and add the 'eventsDir' to the options in the DartCommands initializer in index.js

`Events/messageCreate.js`

```js
module.exports = {
  name: 'messageCreate',
  once?: true | false, // If set to true, the event will only be ran once
  async run(message) {
    if(message.author.bot) return
    console.log(message.channel)
  }
}
```

#### With TypeScript

```ts
import { IEvent } from "dartcommands";

export default {
  name: "messageCreate",
  async run(message) {
    if (message.author.bot) return;
    console.log(message.channel);
  },
} as IEvent;
```
