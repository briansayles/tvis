import { responsiveFontSize, responsiveWidth, responsiveHeight, styles, colors } from '../styles'
import { TouchableHighlight, View, TouchableOpacity, Icon, ActivityIndicator, Pressable, StyleSheet, SectionList} from 'react-native'
import { Text, Button, } from '@rneui/themed'
import { SwipeRow} from 'react-native-swipe-list-view'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

export function SwipeableCollapsibleSectionList (props) {
  const [collapsedState, setCollapsedState] = useState([])
  const buttonSize = 2.5
  const buttonSpacing = 1.5

  useEffect(() => {
    var initiallyCollapsedArray = []
    props.sections.forEach((item, index) => { initiallyCollapsedArray.push(item.initiallyCollapsed || false)})
    setCollapsedState(initiallyCollapsedArray);
    return () => {setCollapsedState(Array(props.sections.length).fill(initiallyCollapsedArray))}
  }, []);
  const functionWrapper = (wrappedFunction, index) => {
    // ref.closeRow()
    wrappedFunction
  }
  return (
    <SectionList
      sections={props.sections}
      keyExtractor={(item, index) => {
        return (item.__typename + index.toString())        
      }}
      stickySectionHeadersEnabled={true}
      renderSectionHeader={({ section: { title, data, createFunction, sectionIndex, includeCountInTitle, titleStyles}}) => (
        <View style={[styles.sectionTitle, {}]}>
          <Pressable style={{flexDirection: 'row', alignItems: 'center', flex: 9, justifyContent: 'flex-start'}}
            onPress={()=> {
              setCollapsedState(
                collapsedState.map((mappedItem, mappedIndex)=>{
                  return (sectionIndex === mappedIndex ? !mappedItem : mappedItem)
                })
              )
            }}
          >
            {title != "" && <Ionicons name={collapsedState[sectionIndex] ? 'chevron-forward-circle' : 'chevron-down-circle'} size={responsiveFontSize(2.5)}/>}
            <Text style={[titleStyles, styles.sectionTitleText, {}]}>{title} {includeCountInTitle ? '(' + data.length + ')':null}  </Text>
          </Pressable>
          <View style={{flex: 1}}>            
            {createFunction && <Ionicons onPress={()=>functionWrapper(createFunction())} name='add-circle' size={responsiveFontSize(2.5)} color="green"/>}
          </View>   
        </View>
      )}
      renderItem= {({item, index, section: {sectionIndex, rightButtons, renderFrontRow}})=> {
        return(
          // <SwipeRow
          //   closeOnRowPress={false}
          //   swipeToOpenPercent={10}
          //   rightOpenValue={-responsiveFontSize(0*rightButtons.length * (buttonSize + 2 * buttonSpacing))}
          // >
          //   <View style={[{}]}>
          //     {rightButtons.map((buttonData, buttonIndex) => {return (
          //       <View style={[
          //         styles.backRightBtn, 
          //         collapsedState[sectionIndex] ? styles.collapsed : null,
          //         {backgroundColor: buttonData.backgroundColor, right: buttonIndex * responsiveFontSize(buttonSize + buttonSpacing)}]}
          //         key={buttonIndex}
          //       >
          //       </View>
          //     )
          //     })}
          //   </View>
            renderFrontRow(item, index, collapsedState[sectionIndex])              
          // </SwipeRow>
        )
      }}
    />
  )
}