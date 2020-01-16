const colors = {
  turquoise: "#00AFA1",
  white: "#FFFFFF",
  person: "#DD514D"
}

const dimensions = {
  medium: {
    minHeightPx: 600,
  },
  large: {
    minHeightPx: 400,
    minWidthPx: 700,
  }
}

const breakpoints = {
  'medium': `(min-height: ${ dimensions.medium.minHeightPx }px)`,
  'large': `(min-width: ${ dimensions.large.minWidthPx }px) and (min-height: ${ dimensions.large.minHeightPx }px)`
}

export { colors, breakpoints, dimensions };
