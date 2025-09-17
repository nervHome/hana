export interface Channel {
  'display-name': {
    '#text': string
    lang: string
  }
  id: number
}

export interface Programme {
  start: string
  stop: string
  channel: number
  title: {
    '#text': string
    lang: string
  }
  desc: {
    lang: string
  }
}

export interface EPG_XML {
  tv: {
    channel: Channel[]
    programme: Programme[]
  }
}
