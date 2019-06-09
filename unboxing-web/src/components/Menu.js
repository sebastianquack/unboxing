import React from 'react';
import styled from 'styled-components';

import {Button, LocaleText, UIText} from './';
import { breakpoints } from '../config/globalStyles'

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
            <UIText styleKey="menu-text"><LocaleText object={item} field="content"/></UIText>
          }
        </MenuContent>
      </MenuItem>
    )

    console.log(this.props.menuData);
    return <Container>
      <TopRight>
        <Button
              type={"menu-close"}
              onClick={this.props.onClose}
        />
      </TopRight>
      <MenuBody>
        <UIText styleKey="menu-title"><LocaleText stringsKey="main-title"/></UIText>
        <MenuDescription><UIText styleKey="menu-description"><LocaleText stringsKey="menu-text"/></UIText></MenuDescription>
        <ul>{menuItems}</ul>
      </MenuBody>
      <Curve />
    </Container>
  }
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 50vw;
  height: 100vh;
  background-color: #000;
  z-index: 100;
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
`

const TopRight = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  padding: 25px;
  z-index: 110;
  @media (${breakpoints.large}) {
    padding: 25px;
  }  
`

const MenuBody = styled.div`
  margin-top: 164px;
  padding-left: 64px;
  padding-right: 64px;
  position: relative;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: left;

`

const MenuDescription = styled.div`
  margin-top: 25px;
  margin-bottom: 50px;
`

const MenuItem = styled.li`
  display: flex;
  flex-direction: row;
  margin-bottom: 7px;
`

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  border-bottom: ${props => props.last ? "none" : "1px solid #fff;"};
`


