import React from 'react';
import { renderToString } from 'react-dom/server'
import styled from 'styled-components/macro'
import L, { divIcon } from 'leaflet'
import { Map as LeafletMap, ImageOverlay, Marker, Rectangle } from 'react-leaflet'

import 'leaflet/dist/leaflet.css';

import { LocaleText, localeText, MapButtonMarker, LanguageContext } from './';
import { breakpoints } from '../config/globalStyles';

const debugShowRegions = false

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
  }]
}

*/


class Map extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      scaleFactor: 1,
      transitionOrder: "scale-first"
    }
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
  }


  offsetToMapCoords = ({left, top}) => {
    const mapData = this.props.data.content.mapData
    const ar = mapData.imageHeight / mapData.imageWidth
    return [ar*(100-top), left]
  };

  regionToMapBounds = ({x1, x2, y1, y2}, zoomFactor=1) => {
    const mapData = this.props.data.content.mapData
    if (zoomFactor) {
      x1 -= Math.round(((((x2-x1) * zoomFactor) - (x2-x1)) /2 ))
      x2 += Math.round(((((x2-x1) * zoomFactor) - (x2-x1)) /2 ))
      y1 -= Math.round(((((y2-y1) * zoomFactor) - (y2-y1)) /2 ))
      y2 += Math.round(((((y2-y1) * zoomFactor) - (y2-y1)) /2 ))
    }
    // console.log(zoomFactor, x1, x2, y1, y2)
    const bounds = [
      this.offsetToMapCoords({left:x1, top:y1}), 
      this.offsetToMapCoords({left:x2, top:y2})
    ];
    return bounds
  };

  render () {
    if(!this.props.data || !this.props.data.content || !this.props.data.content.mapData) return null;

    const mapData = this.props.data.content.mapData
    const region = mapData.regions[this.props.currentMapRegionIndex]

    const challengeButtons = this.props.data.challenges.map((challenge, index)=> {
      const mapPositionsPerc = mapData.challenges.find( c => c.challenge_name === challenge.name ) || {x:0, y:0}
      const isInsideCurrentRegion = 
        mapPositionsPerc.x > region.x1 && 
        mapPositionsPerc.x < region.x2 && 
        mapPositionsPerc.y > region.y1 && 
        mapPositionsPerc.y < region.y2

      return <MapButtonMarker 
        show={ this.state.displayIcons}
        disabled={ !isInsideCurrentRegion }
        transitionOrder={ this.state.transitionOrder }
        key={challenge._id}
        onClick={ ()=>this.props.navigateToChallenge(challenge._id) }
        position={this.offsetToMapCoords({
          top: mapPositionsPerc.y,
          left: mapPositionsPerc.x,
        })}
        title={index + 1}
        subtitle={localeText(challenge.stages[0],"header", this.props.language)}
      />
    })

    console.log(this.state.transitionOrder )

    var bounds = this.regionToMapBounds({x1:0, y1: 0, x2: 100, y2: 100})

    const DebugMarker = ({left, top}) => 
      <Marker 
        position={this.offsetToMapCoords({left:100, top:100})}
        icon={divIcon({
          html: renderToString(<mark>{left},{top}</mark>)
        })}
      />

    const DebugRegionMarker = region => {
      if (region.region) region = region.region // quick fix
      return <Rectangle 
        bounds={this.regionToMapBounds(region)}
        attribution={region.title_en}
      />}

    return <Container> 
        <LeafletMap
          style={{
            width: "100%",
            backgroundColor: "transparent",
            height: "100%",
            visibility: this.props.visible ? "visible" : "hidden"
          }}
          crs={L.CRS.Simple}
          animate={true}
          duration={1.5}
          minZoom={-2}
          zoom={this.state.scaleFactor}
          useFlyTo={true}
          bounds={this.regionToMapBounds(region)}
          doubleClickZoom={true}
          dragging={true}
          scrollWheelZoom={false}
          tap={false}
          touchZoom={true}
          boxZoom={false}
          >

          <ImageOverlay
            url={"/images/" + mapData.filename}
            bounds={bounds}
          />

          { challengeButtons }

          { region.nextButtonX &&
            <MapButtonMarker
              show={ this.state.displayIcons }
              transitionOrder={ this.state.transitionOrder }
              position={this.offsetToMapCoords({
                  left: mapData.regions[this.props.currentMapRegionIndex].nextButtonX,
                  top: mapData.regions[this.props.currentMapRegionIndex].nextButtonY,
                })}
              onClick={this.props.nextMapRegion}
              title={<img style={{height:"1em", marginTop:"0.2em", marginLeft:"0.1em"}} src="images/RightCorner.svg" alt="next" />}
              subtitle={ localeText(mapData.regions[this.props.currentMapRegionIndex+1],"title", this.props.language) }
            /> 
          }

          { region.prevButtonX &&
            <MapButtonMarker
              show={ this.state.displayIcons}
              transitionOrder={ this.state.transitionOrder }
              position={this.offsetToMapCoords({
                  left: mapData.regions[this.props.currentMapRegionIndex].prevButtonX,
                  top: mapData.regions[this.props.currentMapRegionIndex].prevButtonY,
                })}
              onClick={this.props.prevMapRegion}
              title={<BackImage style={{height:"1em", marginTop:"0.2em", marginLeft:"-0.1em"}} src="images/RightCorner.svg" alt="previous" />}
              subtitle={localeText(mapData.regions[this.props.currentMapRegionIndex-1],"title", this.props.language)}
            />
          }

          { debugShowRegions && mapData.regions.map( (region, index) => 
            <DebugRegionMarker key={index} region={region} />) 
          }
            
          {/* <DebugMarker left="100" top="100" /> */}
          
        </LeafletMap> 
    </Container>
  }
}

export { Map }

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  @media ${breakpoints.large} {
  }

  .leaflet-control-container {
    display: none;
  }

  .leaflet-marker-icon {
    background: transparent;
    border: none;
  }

  .leaflet-container {
    font-family: DINPro !important;
  }

`

const MapImg = styled.img`
  opacity: 0.8;
  visibility: ${ props => props.visible ? "visible" : "hidden" }; 
  ${ props => `${props.scaleDimension}: ${10000 / props.scaleDelta}${ props.scaleDimension === "width" ? "vw" : "vh" }`};
`

const BackImage = styled.img`
 transform: scaleX(-1);
`