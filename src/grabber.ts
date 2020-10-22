import SocketIOClient from "socket.io-client";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

import { Helpers } from "./helpers";

export interface CPGrabberOptions {
  room: string;
  detectNSFW?: boolean;
  splitByOwner: boolean;
  saveAllMedia: boolean;
  keywords: string[];
}

export class CPGrabber implements CPGrabberOptions {

  private client: SocketIOClient.Socket;
  room: string = `15min`;
  detectNSFW: boolean = false;
  splitByOwner: boolean = true;
  saveAllMedia: boolean = false;
  keywords: string[] = [
    'risk',
    '10s',
    '5s',
    '3s'
  ];

  constructor(options?: CPGrabberOptions) {
    Object.assign(this, {...options});

    this.client = SocketIOClient("https://chatpic.org/?EIO=3&transport=websocket", {
      reconnectionDelayMax: 10000,
      path: '/socket.io'
    });

    this.client.on('close', this.onClose.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('connect', this.onConnect.bind(this));
  }

  // private

  private async onConnect() {
    console.log(`connection with chatpic.org open! creating user...`);

    this.client.emit('get-ads');
    this.client.emit('create-user', Helpers.makeUserId(), this.onCreateUser.bind(this));
  }

  private onCreateUser(data: any) {
    console.log(`user created! getting channels...`);

    this.client.emit('get-channels', this.onGetchannels.bind(this));
  }

  private onGetchannels(data: any) {
    console.log(`channels received! joining room '${this.room}'...`);

    this.client.emit('join', { roomName: this.room, parentRoomName: null }, this.onJoinRoom.bind(this));
  }

  private onJoinRoom(data: any) {
    console.log(`room '${this.room}' joined! awaiting media...`);

    this.client.on('media', this.onIncomingMedia.bind(this));
  }

  private async onIncomingMedia(data: any) {
    let isRisk = false;

    for (const kwd of this.keywords) {
      if (data.name.toLowerCase().indexOf(kwd) > -1 || this.saveAllMedia) {
        isRisk = true;
        break;
      }
    }

    if (isRisk) {
      console.log(`new media (${data.type}) incoming... we got a risk! title: ${data.name}`);

      const url = `https://chatpic.org/media/${data.filename}`;
      const response = await fetch(url);
      const imageBuffer = await response.buffer();
      
      let savePath = `./saves`;

      if (this.splitByOwner) {
        savePath = path.join(savePath, data.ownerNickname);

        if (!fs.existsSync(savePath)) {
          fs.mkdirSync(savePath);
        }
      }

      savePath = path.join(savePath, data.filename);
      const metaSavePath = `${savePath}.json`;

      fs.writeFile(savePath, imageBuffer, () => {});
      fs.writeFile(metaSavePath, JSON.stringify(data, null, 2), () => {});
    } else {
      console.log(`new media (${data.type}) incoming... skip because its not a risk!`);
    }
  }

  private onClose() {
    console.log(`connection closed :(`);
  }

  private onError(err: any) {
      console.log(`error:`, err);
    }
}