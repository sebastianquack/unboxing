export default cleanJSON = (string)=> {
    let cleanText = string.replace(/<\/?[^>]+(>|$)/g, "");
    cleanText = cleanText.replace(/&nbsp;/gi,'');
    return cleanText;
}
