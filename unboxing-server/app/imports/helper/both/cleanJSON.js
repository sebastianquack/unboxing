export default cleanJSON = (string)=> {
  if(!string) return null;
  let cleanText = string.replace(/<\/?[^>]+(>|$)/g, "");
  cleanText = cleanText.replace(/&nbsp;/gi,'');
  return cleanText;
}
