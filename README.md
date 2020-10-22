# chatpic-risk-grabber

automatically grab pictures tagged with custom keywords from chatpic.org rooms

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

### license

any modification to this project must be published in no manner other than nailing the complete source code to the door of a church without permission from the church.