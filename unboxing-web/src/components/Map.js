import React from 'react';
import styled from 'styled-components'

import { LocaleText, UIText } from './';
import { formatChallengeTitle } from '../helpers';
import { breakpoints } from '../config/globalStyles';

/* JSON in website data - format:

"mapData": {
  "filename": "Map.png",
  "regions": [{
      "title_de": "Satz 1",
      "title_en": "1st movement",
      "x1": 23,
      "x2": 52,
      "y1": 18,
      "y2": 53,
      "nextButtonX": 40,
      "nextButtonY": 30
    },
    {
      "title_de": "Satz 1",
      "title_en": "1st movement",
      "x1": 23,
      "x2": 52,
      "y1": 18,
      "y2": 53
    },
    {
      "title_de": "Satz 2",
      "title_en": "2nd movement",
      "x1": 53,
      "x2": 90,
      "y1": 68,
      "y2": 95
    }
  ],
  "challenges": [{
    "challenge_name": "web1",
    "x": 30,
    "y": 20
  }, {
    "challenge_name": "web2",
    "x": 30,
    "y": 30
  }, {
    "challenge_name": "web3",
    "x": 30,
    "y": 45
  }, {
    "challenge_name": "web4",
    "x": 55,
    "y": 45
  }, {
    "challenge_name": "web5",
    "x": 60,
    "y": 75
  }, {
    "challenge_name": "web6",
    "x": 70,
    "y": 90
  }, {
    "challenge_name": "web7",
    "x": 80,
    "y": 80
  }, {
    "challenge_name": "web8",
    "x": 90,
    "y": 90
  }, {
    "challenge_name": "web9",
    "x": 90,
    "y": 80
  }, {
    "challenge_name": "web10",
    "x": 100,
    "y": 100
  }, {
    "challenge_name": "web11",
    "x": 50,
    "y": 50
  }, {
    "challenge_name": "web12",
    "x": 40,
    "y": 40
  }]
}

*/


class Map extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      scaleDimension: "width",
      scaleFactor: 1,
      transitionOrder: "scale-first"
    }
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    window.addEventListener("orientationchange", this.updateDimensions);
    this.setState({
      displayIcons: this.props.displayIcons,
      scaleFactor: this.props.scaleFactor,
    })
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener("orientationchange", this.updateDimensions);
  }

  componentDidUpdate(prevProps) {

    console.log(this.props.scaleFactor, prevProps.scaleFactor)
    if (prevProps.displayIcons !== this.props.displayIcons || prevProps.scaleFactor !== this.props.scaleFactor) {
      const buttonsRemoved = prevProps.displayIcons && !this.props.displayIcons
      this.setState({
        transitionOrder: ( buttonsRemoved ? "scale-last" : "scale-first" )
      }, () => {
        console.log("set state")
        this.setState({
          displayIcons: this.props.displayIcons,
          scaleFactor: this.props.scaleFactor,
        })
      })
    } 
  }

  updateDimensions() {
    const region = this.props.data.content.mapData.regions[this.props.currentMapRegionIndex]

    const imageNaturalWidthPx = this.refs.mapImg.naturalWidth
    const imageNaturalHeightPx = this.refs.mapImg.naturalHeight
    const imageScaledWidthPx = this.refs.mapImg.width
    const imageScaledHeightPx = this.refs.mapImg.height
    const regionNaturalWidthPx = (region.x2 - region.x1)/100 * imageNaturalWidthPx
    const regionNaturalHeightPx = (region.x2 - region.x1)/100 * imageNaturalHeightPx
    const regionScaledWidthPx = (region.x2 - region.x1)/100 * imageScaledWidthPx
    const regionScaledHeightPx = (region.x2 - region.x1)/100 * imageScaledHeightPx
    const viewportWidthPx = window.innerWidth
    const viewportHeightPx = window.innerHeight
    const imageAspectRatio = imageNaturalWidthPx / imageNaturalHeightPx
    const viewportAspectRatio = viewportWidthPx / viewportHeightPx

    console.log(imageNaturalWidthPx, imageScaledWidthPx)

    this.setState({
      imageScaledWidthPx,
      imageScaledHeightPx
    })

    this.setState({ 
      scaleDimension: imageAspectRatio > viewportAspectRatio ? "width" : "height"
    })
  }  

  render () {
    if(!this.props.data || !this.props.data.content.mapData) return null;
    const region = this.props.data.content.mapData.regions[this.props.currentMapRegionIndex]

    const challengeButtons = this.props.data ? this.props.data.challenges.map((challenge, index)=> {
      const mapPositionsPerc = this.props.data.content.mapData.challenges.find( c => c.challenge_name === challenge.name ) || {x:0, y:0}
      return <ChallengeButton 
        show={ this.state.displayIcons}
        transitionOrder={ this.state.transitionOrder }
        key={challenge._id}
        onClick={()=>{this.props.navigateToChallenge(challenge._id)}}
        offset={{
          top: mapPositionsPerc.x,
          left: mapPositionsPerc.y,
        }}
      >
        <ChallengeButtonNumber>
          <UIText styleKey="challenge-select-title" >{index + 1}</UIText>
        </ChallengeButtonNumber>  
        
        <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={challenge.sequence} field="title"/>
          </UIText>
        </ChallengeButtonSubtitle>
        
        <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={challenge.sequence} field="subtitle"/>
          </UIText>
        </ChallengeButtonSubtitle>
      </ChallengeButton>
    }) : null;

    const nextMovementButtons = this.props.data ? this.props.data.content.mapData.regions.map((region, index)=>
    (this.props.currentMapRegionIndex < (this.props.data.content.mapData.regions.length - 1) ? 
    <ChallengeButton
      show={ this.state.displayIcons}
      key={index}
      transitionOrder={ this.state.transitionOrder }
      offset={{
          left: this.props.data.content.mapData.regions[this.props.currentMapRegionIndex].nextButtonX,
          top: this.props.data.content.mapData.regions[this.props.currentMapRegionIndex].nextButtonY,
        }}
      onClick={this.props.nextMapRegion}
      >
      <ChallengeButtonNumber>
          <img src="images/RightCorner.svg"/>
      </ChallengeButtonNumber>  
      <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={this.props.data.content.mapData.regions[this.props.currentMapRegionIndex+1]} field="title"/>
          </UIText>
        </ChallengeButtonSubtitle>
    </ChallengeButton> : null)
    ) : null;

    const prevMovementButtons = this.props.data ? this.props.data.content.mapData.regions.map((region, index)=>
    (this.props.currentMapRegionIndex > 0 ? 
    <ChallengeButton
      show={ this.state.displayIcons}
      key={index}
      transitionOrder={ this.state.transitionOrder }
      offset={{
          left: this.props.data.content.mapData.regions[this.props.currentMapRegionIndex].prevButtonX,
          top: this.props.data.content.mapData.regions[this.props.currentMapRegionIndex].prevButtonY,
        }}
      onClick={this.props.prevMapRegion}
      >
      <ChallengeButtonNumber>
          <BackImage src="images/RightCorner.svg"/>
      </ChallengeButtonNumber>  
      <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={this.props.data.content.mapData.regions[this.props.currentMapRegionIndex-1]} field="title"/>
          </UIText>
        </ChallengeButtonSubtitle>
    </ChallengeButton> : null)
    ) : null;

    const scaleDeltaMax = Math.max(region.x2 - region.x1, region.y2 - region.y1)

    console.log(this.state.transitionOrder )

    return <OuterContainer>
        <InnerContainer
          transitionOrder={this.state.transitionOrder}
          style={{
            width: this.state.imageScaledWidthPx+"px", 
            height: this.state.imageScaledHeightPx+"px",
            transform: `translateX(-${region.x1}%) translateY(-${region.y1}%) scale(${ this.state.scaleFactor })`,
            transformOrigin: `${ (region.x2 - region.x1)/2 + region.x1 }% ${ (region.y2 - region.y1)/2 + region.y1 }%`
          }}>
          { prevMovementButtons }
          { nextMovementButtons }
          { challengeButtons }
          <MapImg
            ref="mapImg"
            onLoad={this.updateDimensions}
            scaleDimension={this.state.scaleDimension}
            scaleDelta={this.scaleDimension === "width" ? region.x2 - region.x1 : region.y2 - region.y1}
            scaleDeltaMax={ scaleDeltaMax }
            src={"/images/" + this.props.data.content.mapData.filename}
            alt=""
          />        
        </InnerContainer>
      </OuterContainer>
  }
}

export { Map }

const OuterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100vh;
  z-index: 0;

  @media (${breakpoints.large}) {
  }
`

const InnerContainer = styled.div`
  position: relative;
  top: 0;
  left: 0%;
  z-index: 0;
  overflow: hidden;
  
  transition: transform ${ props => props.transitionOrder === "scale-last" ? "1s 0.3s" : "1s"};
  will-change: transform;

  @media (${breakpoints.large}) {
  }
`

const MapImg = styled.img`
  ${ props => `${props.scaleDimension}: ${10000 / props.scaleDelta}${ props.scaleDimension === "width" ? "vw" : "vh" }`};
`

const ChallengeButton = styled.div`
  :hover {
    cursor: pointer;
  }

  align-items: center;
  display: flex;
  flex-direction: column;

  position: absolute;
  top: ${props=>props.offset.top + "%"};
  left: ${props=>props.offset.left + "%"};
  opacity: ${ props => props.show ? 1 : 0};

  transform: translateX(-50%) translateY(-25%);
  transition: opacity ${ props => props.transitionOrder === "scale-first" ? "1s 0.8s" : "0.4s"};
  will-change: opacity;

  @media (${breakpoints.large}) {}
`

const BackImage = styled.img`
 transform: scaleX(-1);
`

const ChallengeButtonNumber = styled.div`
  background-image: url(/images/PassageButtonBg.png);
  background-size: contain;
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  display: flex;
  margin-bottom: 5px;
`

const ChallengeButtonSubtitle = styled.div`
  justify-content: center;
  display: none;
  @media (${breakpoints.large}) {
    display: flex;
  }
`