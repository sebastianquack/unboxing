import React from 'react';
import styled from 'styled-components'

import {Button} from './';

export class HorizontalScrollContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      offsetX: 0,
      maxOffsetX: 0
    }
    this.step = 100;

    this.updateDimensions = this.updateDimensions.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.getMaxOffset = this.getMaxOffset.bind(this);
  }

  getMaxOffset() {
    return this.refs.scrollContent.scrollWidth - this.refs.scrollContainer.offsetWidth;
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    this.setState({maxOffsetX: this.getMaxOffset()});
  }

  handleScroll(event) {
    const offsetX = event.target.scrollLeft
    this.setState({offsetX})
  }

  scrollTo(x) {
    this.refs.scrollContainer.scrollTo(x,0)
  }

  render () {
    const childrenWithProps = React.Children.map(this.props.children, child=>
      React.cloneElement(child, {data: this.state.data})
    )
      
    return (

      <Container justifyRight={this.props.justifyRight}>
        {!this.props.noButtons && <Button
          type={"left"}
          style={{top:"-33px", position: "relative", alignSelf: "center", opacity: this.state.offsetX > 0 ? 1 : 0.25}}
          onClick={
            ()=>this.scrollTo(this.state.offsetX - this.step)
          }
        />}
        <ScrollContainer 
            onScroll={this.handleScroll}
            ref="scrollContainer"
          >
          <ScrollContent 
            ref="scrollContent"
          >
            {childrenWithProps}
          </ScrollContent>
        </ScrollContainer>
        {!this.props.noButtons && <Button 
          type={"right"}
          style={{top:"-33px", position: "relative", opacity: this.state.offsetX < this.state.maxOffsetX ? 1 : 0.25}}
          onClick={
            ()=>this.scrollTo(this.state.offsetX + this.step)
          }
        />}
      </Container>

    )
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props=>props.justifyRight ? "flex-end" : "flex-start"}
  max-width: 100%;

  overflow: hidden; 
  margin-bottom: -25px; /* hide scrollbar at bottom */

`

const ScrollContainer = styled.div`
  /*top: 25px; position: relative; /* hide scrollbar at bottom */
  padding-bottom: 25px;
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-behavior: smooth;
  /*mask: url(#grad-mask);*/
  mask-mode: luminance;
  mask-image: linear-gradient(90deg, transparent 0%, white 10%, white 90%, transparent 100%);    
`

const ScrollContent = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`