import React from 'react';
import styled from 'styled-components/macro'

import { LocaleText, UIText } from './';
import { formatChallengeTitle } from '../helpers';
import { breakpoints } from '../config/globalStyles';

const debugShowRegion = false

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
    //setInterval(this.updateDimensions, 25)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener("orientationchange", this.updateDimensions);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.displayIcons !== this.props.displayIcons || prevProps.scaleFactor !== this.props.scaleFactor) {
      const buttonsRemoved = prevProps.displayIcons && !this.props.displayIcons
      this.setState({
        transitionOrder: ( buttonsRemoved ? "scale-last" : "scale-first" )
      }, () => {
        this.setState({
          displayIcons: this.props.displayIcons,
          scaleFactor: this.props.scaleFactor,
        })
      })
    }
    //if (prevProps.currentMapRegionIndex !== this.props.currentMapRegionIndex) {
    //  this.updateDimensions()
    //}
  }

  updateDimensions() {
    if(!this.props.data || !this.props.data.content || !this.props.data.content.mapData) return null;
    const region = this.props.data.content.mapData.regions[this.props.currentMapRegionIndex]

    const imageNaturalWidthPx = this.refs.mapImg.naturalWidth
    const imageNaturalHeightPx = this.refs.mapImg.naturalHeight
    const imageScaledWidthPx = this.refs.mapImg.width
    const imageScaledHeightPx = this.refs.mapImg.height
    const regionNaturalWidthPx = (region.x2 - region.x1)/100 * imageNaturalWidthPx
    const regionNaturalHeightPx = (region.y2 - region.y1)/100 * imageNaturalHeightPx
    const regionScaledWidthPx = (region.x2 - region.x1)/100 * imageScaledWidthPx
    const regionScaledHeightPx = (region.y2 - region.y1)/100 * imageScaledHeightPx
    const viewportWidthPx = window.innerWidth
    const viewportHeightPx = window.innerHeight
    const imageAspectRatio = imageNaturalWidthPx / imageNaturalHeightPx
    const regionAspectRatio = regionNaturalWidthPx / regionNaturalHeightPx
    const viewportAspectRatio = viewportWidthPx / viewportHeightPx
    const scaleDimension = regionAspectRatio > viewportAspectRatio ? "width" : "height"    
    const topOffsetPerc = 50 * ((viewportHeightPx - regionScaledHeightPx)/imageScaledHeightPx) // vertial centering
    const leftOffsetPerc = 0 * 50 * ((viewportWidthPx - regionScaledWidthPx)/imageScaledWidthPx) // horizontal centering
    const adjustedRegionCoords = {
      x1: region.x1 - leftOffsetPerc,
      x2: region.x2 + leftOffsetPerc,
      y1: region.y1 - topOffsetPerc,
      y2: region.y2 + topOffsetPerc
    }

    // console.log("imageNaturalWidthPx", imageNaturalWidthPx)
    // console.log("imageNaturalHeightPx", imageNaturalHeightPx)
    // console.log("imageScaledWidthPx",imageScaledWidthPx)
    // console.log("imageScaledHeightPx", imageScaledHeightPx)
// 
    // console.log("regionScaledHeightPx", regionScaledHeightPx)
    // console.log("imageScaledHeightPx", imageScaledHeightPx)
    // console.log("viewportHeightPx", viewportHeightPx)
    // console.log("topOffsetPerc", topOffsetPerc)
    // console.log("leftOffsetPerc", leftOffsetPerc)
    // console.log("scaleDimension", scaleDimension)

    this.setState({
      imageScaledWidthPx,
      imageScaledHeightPx,
      topOffsetPerc,
      leftOffsetPerc,
      scaleDimension,
      adjustedRegionCoords
    })
  }  

  render () {
    if(!this.props.data || !this.props.data.content || !this.props.data.content.mapData) return null;
    const region = this.props.data.content.mapData.regions[this.props.currentMapRegionIndex]

    const challengeButtons = this.props.data ? this.props.data.challenges.map((challenge, index)=> {
      const mapPositionsPerc = this.props.data.content.mapData.challenges.find( c => c.challenge_name === challenge.name ) || {x:0, y:0}
      const isInsideCurrentRegion = 
        mapPositionsPerc.x > region.x1 && 
        mapPositionsPerc.x < region.x2 && 
        mapPositionsPerc.y > region.y1 && 
        mapPositionsPerc.y < region.y2
      return <ChallengeButton 
        show={ this.state.displayIcons /*&& isInsideCurrentRegion*/}
        transitionOrder={ this.state.transitionOrder }
        key={challenge._id}
        onClick={()=>{this.props.navigateToChallenge(challenge._id)}}
        offset={{
          top: mapPositionsPerc.y,
          left: mapPositionsPerc.x,
        }}
      >
        <ChallengeButtonNumber>
          <UIText styleKey="challenge-select-title" >{index + 1}</UIText>
        </ChallengeButtonNumber>  
        
        <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={challenge.stages[0]} field="header"/>
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
        <UIText styleKey="challenge-select-title" >
          <img style={{height:"1em", marginTop:"0.2em", marginLeft:"0.1em"}} src="images/RightCorner.svg" alt="next" />
        </UIText>
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
        <UIText styleKey="challenge-select-title" >
          <BackImage style={{height:"1em", marginTop:"0.2em", marginLeft:"-0.1em"}} src="images/RightCorner.svg" alt="next" />
        </UIText>        
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
          onTransitionEnd={()=>console.log("transitionEnd")}
          style={{
            width: this.state.imageScaledWidthPx+"px", 
            height: this.state.imageScaledHeightPx+"px",
            //marginTop: this.state.topOffsetPerc+"%",
            //marginLeft: this.state.leftOffsetPerc+"%",
            transform: `translateX(-${region.x1/*-this.state.leftOffsetPerc*/}%) translateY(-${region.y1/*-this.state.topOffsetPerc*/}%) scale(${ this.state.scaleFactor })`,
            transformOrigin: `${ (region.x2 - region.x1)/2 + region.x1 }% ${ (region.y2 - region.y1)/2 + region.y1 }%`
          }}>
          { prevMovementButtons }
          { nextMovementButtons }
          { challengeButtons }
          <MapImg
            visible={this.props.visible}
            ref="mapImg"
            onLoad={this.updateDimensions}
            scaleDimension={this.state.scaleDimension}
            scaleDelta={this.state.scaleDimension === "width" ? region.x2 - region.x1 : region.y2 - region.y1}
            src={"/images/" + this.props.data.content.mapData.filename}
            alt=""
          />
          { debugShowRegion && <Region {...region} /> }
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

  @media ${breakpoints.large} {
  }

  * { transition: all 1s !important}
`

const InnerContainer = styled.div`
  position: relative;
  top: 0;
  left: 0%;
  z-index: 0;
  overflow: hidden;
  
  transition: transform ${ props => props.transitionOrder === "scale-last" ? "1s 0.3s" : "1s"};
  will-change: transform;

  @media ${breakpoints.large} {
  }
`

const MapImg = styled.img`
  opacity: 0.8;
  visibility: ${ props => props.visible ? "visible" : "hidden" }; 
  ${ props => `${props.scaleDimension}: ${10000 / props.scaleDelta}${ props.scaleDimension === "width" ? "vw" : "vh" }`};
`

const Region = styled.div`
  position: absolute;
  left: ${ props => props.x1 }%;
  top: ${ props => props.y1 }%;
  width: ${ props => props.x2 - props.x1 }%;
  height: ${ props => props.y2 - props.y1 }%;
  border: 3px white dotted;
  pointer-events: none;
  box-sizing: border-box;
`

const ChallengeButton = styled.div`
  :hover {
    cursor: pointer;
  }

  align-items: center;
  display: flex;
  flex-direction: column;
  z-index: 1;

  position: absolute;
  top: ${props=>props.offset.top + "%"};
  left: ${props=>props.offset.left + "%"};
  opacity: ${ props => props.show ? 1 : 0};

  transform: translateX(-50%) translateY(-25%);
  transition: opacity ${ props => props.transitionOrder === "scale-first" ? "1s 0.8s" : "0.4s"};
  will-change: opacity;

  @media ${breakpoints.large} {}
`

const BackImage = styled.img`
 transform: scaleX(-1);
`

const ChallengeButtonNumber = styled.div`
  background-image: url(/images/PassageButtonBg.png);
  background-repeat: no-repeat;
  background-size: contain;
  width: 30px;
  height: 30px;
  @media ${breakpoints.large} {
    width: 60px;
    height: 60px;
  }
  align-items: center;
  justify-content: center;
  display: flex;
  margin-bottom: 5px;
`

const ChallengeButtonSubtitle = styled.div`
  width: 10em;
  justify-content: center;
  text-align: center;
  @media ${breakpoints.large} {
    display: flex;
  }
`