import React from 'react';
import { renderToString } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { Marker } from 'react-leaflet'
import styled from 'styled-components/macro'

import { UIText } from './';
import { breakpoints } from '../config/globalStyles';

const MapButtonMarker = ({show, disabled, onClick, transitionOrder, position, title, subtitle}) => <Marker 
    onClick={disabled ? null : onClick}
    position={position}
    icon={divIcon({
      html: renderToString(
        <MapButton
            show={show}
            disabled={disabled}
            transitionOrder={transitionOrder}
            title={title}
            subtitle={subtitle}
          />
        )
      })}
  />

const MapButton = ({show, disabled, transitionOrder, title, subtitle}) => 
  <ChallengeButton 
      show={ show }
      disabled={disabled}
      transitionOrder={ transitionOrder }
    >

    <ChallengeButtonNumber>
      <UIText styleKey="challenge-select-title" >{title}</UIText>
    </ChallengeButtonNumber>  
    
    <ChallengeButtonSubtitle>
      <UIText styleKey="challenge-select-subtitle" >
        {subtitle}
      </UIText>
    </ChallengeButtonSubtitle>

  </ChallengeButton>

export {MapButton, MapButtonMarker}

const ChallengeButton = styled.div`
  :hover {
    cursor: pointer;
  }

  align-items: center;
  display: flex;
  flex-direction: column;
  z-index: 1;

  opacity: ${ props => props.show ? props.disabled ? 0.3 : 1 : 0};

  transform: translateX(-50%) translateY(-10px);
  transition: opacity ${ props => props.transitionOrder === "scale-first" ? "1s 0.8s" : "0.4s"};
  will-change: opacity;

  /*background: #f006;*/

  height: 50vh; /* need sufficuent height because of leaflet container */

  @media ${breakpoints.large} {}
`

const ChallengeButtonNumber = styled.div`
  background-image: url(/images/PassageButtonBg.png);
  /*background-color: #ff06;*/
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
  width: 15em;
  justify-content: center;
  text-align: center;
  @media ${breakpoints.large} {
    display: flex;
  }
`