export default class SoundCommand{
    isEmpty = true;
    timeStamp = "";
    url = "";
  
    constructor(url, timeStamp, isEmpty){
      this.isEmpty = isEmpty;
      this.timeStamp = timeStamp;
      this.url = url;
    }
  }