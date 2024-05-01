import { responsiveFontSize, styles, } from '../styles'
import { View, Pressable, SectionList} from 'react-native'
import { Text, } from '@rneui/themed'
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
          renderFrontRow(item, index, collapsedState[sectionIndex])              
        )
      }}
    />
  )
}