import React from 'react';
import styled from 'styled-components'


export class HorizontalScrollContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      offsetX: 0,
      minOffsetX: 0
    }    
    this.step = 100;

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
        <button 
          style={{visibility: this.state.offsetX < 0 ? "visible" : "hidden", marginRight: 10}}
          onClick={
          ()=>this.setState({offsetX: this.state.offsetX < 0 ? this.state.offsetX + this.step : 0 }, ()=>console.log(this.state.offsetX))
        }>{"<"}</button>
        <ScrollContainer>
          <ScrollContent 
            ref="scrollContent"
            style={{left: this.state.offsetX}}
          >
            {childrenWithProps}
          </ScrollContent>
        </ScrollContainer>
        <button 
          style={{visibility: this.state.offsetX > this.state.minOffsetX ? "visible" : "hidden", marginLeft: 10}}
          onClick={
          ()=>this.setState({offsetX: this.state.offsetX > this.state.minOffsetX ? this.state.offsetX - this.step : this.state.minOffsetX }, ()=>console.log(this.state.offsetX))
        }>{">"}</button>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
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
