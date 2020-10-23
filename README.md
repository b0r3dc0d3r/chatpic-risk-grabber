# chatpic-risk-grabber

automatically grab pictures tagged with custom keywords from chatpic.org rooms

### features

- auto-save media from selected room
- filter media by owner
- `experimental` media classification on `photo` type
- `experimental` face matching to find people in posted photos

### instructions

- install nodejs
- run `npm install` in this folder to install dependencies
- run `npm run start` to lauch
- enjoy your saved pictures under `saves/` folder

### configuration

edit `main.ts` file to change configuration

```typescript
const CP_GRABBER_OPTIONS: CPGrabberOptions = {
  room: '15min',
  splitByOwner: true,
  keywords: [
    'risk',
    '10s',
    '5s',
    '3s'
  ],
  saveAllMedia: false, // set true to disable keywords filter and save all media
};
```

### face-matching

to allow face matching to work add pictures of well defined faces under the `samples/` folder,
best matches will be saved under `saves/_SUPERRISK` folder

### license

any modification to this project must be published in no manner other than nailing the complete source code to the door of a church without permission from the church.