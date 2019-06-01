import React from 'react';

const LanguageContext = React.createContext()

class BaseStateProvider extends React.Component {
  constructor() {
    super()
    this.navigationStates = [
      "welcome",
      "challenges",
      "challenge"
    ]
    this.languages = [
     "en",
     "de" 
    ]
    this.state = {
      navigationState: "welcome",
      language: "en",
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.navigateToChallenge = this.navigateToChallenge.bind(this)
    this.toggleLanguage = this.toggleLanguage.bind(this)
  }

  toggleLanguage() {
    this.setState({
      language: ( this.state.language === "en" ? "de" : "en")
    })
  }

  handleNavigation(target) {
    if (this.navigationStates.indexOf(target) === -1 ) {
      console.warn("no route to " + target + " exists"); return;
    }
    this.setState({
      navigationState: target
    })
  }

  navigateToChallenge(currentChallenge) {
    this.setState({currentChallenge});
    this.handleNavigation("challenge");
  }

  render () {

    const newKids = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        navigationState: this.state.navigationState,
        currentChallenge: this.state.currentChallenge,
        navigateTo: this.handleNavigation,
        navigateToChallenge: this.navigateToChallenge,
        language: this.state.language,
        toggleLanguage: this.toggleLanguage,
      });
    });

    return <LanguageContext.Provider value={this.state.language}>
      { newKids }
    </LanguageContext.Provider>
  }
}

export {
  BaseStateProvider,
  LanguageContext
}