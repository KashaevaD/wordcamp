type TUser = {
    name: string,
    score: number,
    id: number,
    isActive: boolean,
    result: string
};

type TCard = {
    id:number,
    wordId:number,
    isOpen:boolean,
    isHide:boolean,
    word:string
};

type TInputData = {
    type:string,
    languages: {
        first: string,
        last: string
    },
    difficulty:string,
    username:string
};

type TOutputData = {
    difficulty: {src: string}[],
    id: string,
    language: string,
    player: string
};

type TStoreData =  {
  cards: TCard,
  type: string,
  state: boolean,
  difficulty: string,
  languages: {
        first: string,
        last: string
  },
  users: TUser[],
  countHiddenBlock: number
};

type TItemLang = {
    name: string,
    src: string
};

type TLanguages = {
    first: TItemLang,
    last: TItemLang
};
