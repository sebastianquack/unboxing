import React from 'react';

const LanguageContext = React.createContext()

const useSession = true

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
      navigationState: (useSession && sessionStorage.getItem('navigationState')) || "welcome",
      currentChallengeId: (useSession && sessionStorage.getItem('currentChallengeId')) || undefined,
      language: sessionStorage.getItem('locale') ? sessionStorage.getItem('locale') : "en",
      challengeInfoOpen: true,
      videoModalUrl: null,
      menuOpen: false,
      playbackControlStatus: "loading", // ready - playing - paused
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.navigateToChallenge = this.navigateToChallenge.bind(this)
    this.toggleLanguage = this.toggleLanguage.bind(this)
    this.toggleChallengeInfo = this.toggleChallengeInfo.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.setChallengeInfo = this.setChallengeInfo.bind(this)
  }

  toggleMenu() {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  toggleLanguage() {
    let locale = this.state.language === "en" ? "de" : "en";
    this.setState({
      language: locale
    })
    sessionStorage.setItem('locale', locale);
  }

  toggleChallengeInfo() {
    this.setState({challengeInfoOpen: !this.state.challengeInfoOpen})
  }

  setChallengeInfo(value) {
    this.setState({challengeInfoOpen: value}) 
  }

  handleNavigation(target) {
    if (this.navigationStates.indexOf(target) === -1 ) {
      console.warn("no route to " + target + " exists"); return;
    }
    this.setState({
      navigationState: target,
      challengeInfoOpen: true
    })
    if (target !== "challenge") {
      this.setState({
        currentChallengeId: undefined
      })
    }
    if (useSession) sessionStorage.setItem('navigationState', target);
  }

  navigateToChallenge(currentChallengeId) {
    this.setState({currentChallengeId});
    this.handleNavigation("challenge");
    if (useSession) sessionStorage.setItem('currentChallengeId', currentChallengeId);
  }

  render () {

    let {children, render, ...other} = this.props

    const newProps = {
      navigationState: this.state.navigationState,
      currentChallengeId: this.state.currentChallengeId,
      navigateTo: this.handleNavigation,
      navigateToChallenge: this.navigateToChallenge,
      language: this.state.language,
      toggleLanguage: this.toggleLanguage,
      toggleChallengeInfo: this.toggleChallengeInfo,
      setChallengeInfo: this.setChallengeInfo,
      challengeInfoOpen: this.state.challengeInfoOpen,
      setVideoModalUrl: (url)=>{
        console.log(url);
        this.setState({videoModalUrl: url})
      },
      videoModalUrl: this.state.videoModalUrl,
      menuOpen: this.state.menuOpen,
      toggleMenu: this.toggleMenu,
      playbackControlStatus: this.state.playbackControlStatus,
      updatePlaybackControlStatus: (s)=>{this.setState({playbackControlStatus: s})},
      ...other
    }

    return <LanguageContext.Provider value={this.state.language}>
      { render(newProps) }
    </LanguageContext.Provider>
  }
}

function withLanguage (WrappedComponent) {
  return class extends React.Component {
    render() {
      return (
        <LanguageContext.Consumer>
          {language => 
            <WrappedComponent
              language={language} {...this.props}
            />    
          }
        </LanguageContext.Consumer>
      )
    }
  }
}

export {
  BaseStateProvider,
  LanguageContext,
  withLanguage,
}