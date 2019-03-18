import { StyleSheet, Dimensions } from 'react-native';

// 1536 x 2048 pixels, 4:3 ratio (~320 ppi density)
const {height, width} = Dimensions.get('window');

const dimensions = {
  screenWidth: width,
  screenHeight: height,
}

const colors = {
  turquoise: "#00AFA1",
  warmWhite: "#F3DFD4"
}

const globalStyles = StyleSheet.create({
  baseText: {
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  },
  control: {
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20
  },
  good: {
    backgroundColor: "green",
    color: 'white',
    paddingHorizontal: 5
  },
  bad: {
    backgroundColor: "red",
    color: "white",
    paddingHorizontal: 5
  }
});

export {globalStyles, dimensions, colors};