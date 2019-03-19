import striptags from 'striptags'
import htmlEntities from 'he'


// get input type of value
// types: number, text
const inputType = (value) => {
  const inputType = typeof(value) == "number" ? "number" : "text"
  return inputType
}

// transform contentaditable input to nice value, according to type
const inputTransform = (value, valueInputType) => {
  const type = valueInputType || inputType(value)
  console.log("before:", type, value)
  // remove html tags
  let transformed = striptags(value)
  // decode html entities (e.g. &nbsp;)
  transformed = htmlEntities.decode(transformed)
  // remove newline, cr, tab, ...
  const nonspace = RegExp(/[^\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g)
  transformed = (transformed.match(nonspace) || []).join('')
  if (type === "number") {
    // remove all non-digits except the decimal dot
    transformed = (transformed.match(/([0-9\.]+)/g) || []).join('')
    transformed = parseFloat(transformed)
    if (isNaN(transformed)) transformed = 0
  }
  console.log("after:", type, value)
  return transformed
}

export {
  inputTransform,
  inputType
}