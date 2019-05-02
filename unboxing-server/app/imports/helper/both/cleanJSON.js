cleanJSON = (string)=> {
  if(!string) return null;
  let cleanText = string.replace(/<\/?[^>]+(>|$)/g, "");
  cleanText = cleanText.replace(/&nbsp;/gi,'');
  return cleanText;
}

const trackNames = [
          "piano1",
          "flute1",
          "oboe1",
          "oboe2",
          "fagott1",
          "fagott2",
          "horn1",
          "horn2",
          "trompete1",
          "trompete2",
          "pauke1",
          "violin1.1",
          "violin1.2",
          "violin1.3",
          "violin1.4",
          "violin2.1",
          "violin2.2",    
          "violin2.3",    
          "violin2.4",    
          "viola1.1",
          "viola1.2",
          "viola1.3",
          "cello1.1",
          "cello1.2",
          "cello1.3",
          "bass1.1",
          "bass1.2"
        ];


export {cleanJSON, trackNames}