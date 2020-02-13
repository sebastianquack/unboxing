const fs = require('fs')
const path = require('path');
const child_process = require('child_process');

const args = process.argv

if (args.length < 4) {
  console.log(`Usage: ${path.basename(args[1])} path offsetMs`)
  console.log(`Example: ${path.basename(args[1])} soundfiles/245-548 -3000`)
}

const filesPath = args[2]
const offsetMs = parseInt(args[3])

var files = fs.readdirSync(filesPath);
for (var file of files) {
  // console.log("   " + file)
  const matches = file.match(/@([0-9]*)/)
  if (matches !== null && Array.isArray(matches) && typeof matches[1] === "string" && matches[1].length > 0) {
    const origOffset = parseInt(matches[1])
    const targetOffset = origOffset + offsetMs
    if (targetOffset < 0) {
      console.warn("!! offset < 0  ")
      //continue
    }
    //console.log(origOffset, targetOffset)
    const targetFile = file.replace(/@([0-9]*)/, "@"+targetOffset)
    console.log("   " + file)
    console.log(" -> " + targetFile)
    const fullSource = filesPath + "/" + file
    const fullTarget = filesPath + "/" + targetFile
    console.log(fullSource)
    console.log(fullTarget)
    fs.renameSync(fullSource, fullTarget)
  }
}


