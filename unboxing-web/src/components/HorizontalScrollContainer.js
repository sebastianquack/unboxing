import React from 'react';
import styled from 'styled-components'

import {Button} from './';

export class HorizontalScrollContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      offsetX: 0,
      minOffsetX: 0
    }    
    this.step = 50;

    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    this.setState({minOffsetX: this.refs.scrollContent.offsetWidth - this.refs.scrollContent.scrollWidth});
  }

  render () {
    const childrenWithProps = React.Children.map(this.props.children, child=>
      React.cloneElement(child, {...this.props, data: this.state.data})
    )
      
    return (
      <Container>
        <Button
          type={"left"}
          style={{margin: 10, opacity: this.state.offsetX < 0 ? 1 : 0.25}}
          onClick={
            ()=>this.setState({offsetX: this.state.offsetX < 0 ? this.state.offsetX + this.step : 0 })
          }
        />
        <ScrollContainer>
          <ScrollContent 
            ref="scrollContent"
            style={{left: this.state.offsetX}}
          >
            {childrenWithProps}
          </ScrollContent>
        </ScrollContainer>
        <Button 
          type={"right"}
          style={{margin: 10, opacity: this.state.offsetX > this.state.minOffsetX ? 1 : 0.25}}
          onClick={
            ()=>this.setState({offsetX: this.state.offsetX > this.state.minOffsetX ? this.state.offsetX - this.step : this.state.minOffsetX })
          }
        />
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`

const ScrollContent = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
`
