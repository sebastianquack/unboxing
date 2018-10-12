import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  baseText: {
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
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

export {globalStyles};