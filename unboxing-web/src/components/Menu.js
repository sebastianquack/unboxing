import React from 'react';
import styled from 'styled-components';

import {Button, LocaleText, UIText} from './';
import { colors, breakpoints } from '../config/globalStyles'

export class Menu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      itemsOpen: this.props.menuData.map(()=>false)
    }

    this.toggleItem = this.toggleItem.bind(this);
  }


  toggleItem(index) {
    let itemsOpen = this.props.menuData.map(()=>false);
    itemsOpen[index] = !this.state.itemsOpen[index];
    this.setState({itemsOpen: itemsOpen});
  }


  render() {

    const menuItems = this.props.menuData.map((item, index)=>
      <MenuItem key={index}>
        <Button
              type={this.state.itemsOpen[index] ? "menu-section-close" : "menu-section-open"}
              onClick={()=>{this.toggleItem(index)}}
        />
        <MenuContent last={index == this.props.menuData.length - 1}>
          <UIText styleKey={this.state.itemsOpen[index] ? "menu-section-open" : "menu-section"}><LocaleText object={item} field="title"/></UIText>
          {this.state.itemsOpen[index] && 
            <UIText styleKey="menu-text"><LocaleText markdown object={item} field="content"/></UIText>
          }
        </MenuContent>
      </MenuItem>
    )

    return <Dark visible={this.props.visible}>
    <Container onClick={(e)=>{e.stopPropagation()}}>
      <TopRight>
        <Button
              type={"menu-close"}
              onClick={this.props.onClose}
        />
      </TopRight>
      <ScrollContainer>
      <MenuBody>
        <UIText styleKey="menu-title"><LocaleText stringsKey="main-title"/></UIText>
        <MenuDescription><UIText styleKey="menu-description"><LocaleText stringsKey="menu-text"/></UIText></MenuDescription>
        <ul>{menuItems}</ul>
      </MenuBody>
      </ScrollContainer>
      <Curve />
    </Container>
    </Dark>
  }
}

const Dark = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgb(0,0,0,0.66);
  opacity: 1;
  z-index: 50;
  visibility: ${props=>props.visible ? "visible" : "hidden"};
`

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #000;
  z-index: 100;
  opacity: 1;

  @media (${breakpoints.large}) {
    width: 50%;      
  }
`

const Curve = styled.div`
  position: absolute;
  right: -20px;
  top: -50%;
  height: 200%;
  width: 200px;
  border-right: 1px solid #fff;
  border-radius: 50%;
  background-color: #000;
  z-index: 105;
  opacity: 1;
`

const TopRight = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  padding: 25px;
  z-index: 150;
  @media (${breakpoints.large}) {
    padding: 25px;
  }  
`


const ScrollContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  direction: rtl;
`

const MenuBody = styled.div`
  direction: ltr;
  margin-top: 50px;
  position: relative;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: left;

  padding-left: 30px;
  padding-right: 30px;

  @media (${breakpoints.large}) {
    margin-top: 110px;
    padding-left: 60px;
    padding-right: 60px;
  }

`
const MenuDescription = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;

  @media (${breakpoints.large}) {
    margin-top: 20px;
    margin-bottom: 50px;
  }
`

const MenuItem = styled.li`
  display: flex;
  flex-direction: row;
  margin-bottom: 7px;
`


const MenuContent = styled.div`
  display: flex;
  flex: 1;
  overflow-y: scroll;
  flex-direction: column;
  margin-left: 10px;
  border-bottom: ${props => props.last ? "none" : "1px solid #fff;"};
  word-break: break-word;
  a { color: ${ colors.turquoise }; }
  a:hover { color: #fff; }
`


